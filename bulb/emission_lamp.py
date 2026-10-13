"""Party mode: the lamp follows the site's emission alarm.
Warning: the lamp slowly turns a menacing red over 10 seconds and stays red.
Blowout: red, with light-blue lightning flashes at the same moments the screens flash and thunder.
Keep this window open during the party. Closing the window stops it."""
import colorsys, json, threading, time, urllib.error, urllib.request
import tinytuya

PROJECT = "stalker-birthday"
API_KEY = "AIzaSyBHWToXlYs8Fd4kQC6oaUuFlMsl1FSVDQs"
URL = ("https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents/config/emission?key=%s" % (PROJECT, API_KEY))
RED = (0.0, 1.0, 0.85)          # hue, saturation, value (0..1)
LIGHTNING = (0.56, 0.45, 1.0)   # light blue
FADE_SECONDS = 10

with open("devices.json", encoding="utf-8") as f:
    dev = json.load(f)[0]
bulb = tinytuya.BulbDevice(dev["id"], address="Auto", local_key=dev["key"])
bulb.set_socketPersistent(True)

current = {}
def poll():
    while True:
        try:
            with urllib.request.urlopen(URL, timeout=6) as r:
                fields = json.load(r).get("fields", {})
            out = {}
            for k, v in fields.items():
                if "integerValue" in v: out[k] = int(v["integerValue"])
                elif "doubleValue" in v: out[k] = float(v["doubleValue"])
                elif "stringValue" in v: out[k] = v["stringValue"]
                elif "booleanValue" in v: out[k] = v["booleanValue"]
            current.clear(); current.update(out)
        except urllib.error.HTTPError as e:
            if e.code == 404: current.clear()
            else: print("Website check failed:", e)
        except Exception as e:
            print("Website check failed:", e)
        time.sleep(1)
threading.Thread(target=poll, daemon=True).start()

def strikes(eid, dur_ms):
    """Same lightning times as the website (ms after the blowout starts)."""
    s = 0
    for ch in str(eid): s = (s * 31 + ord(ch)) & 0xFFFFFFFF
    out, t = [], 600
    while t < dur_ms - 500:
        out.append(t)
        s = (s * 1664525 + 1013904223) & 0xFFFFFFFF
        t += 5000 + (s / 4294967296) * 5000
    return out

def phase(e, now_ms):
    if not e.get("id") or e.get("stopped") or not e.get("start"): return "calm"
    t = now_ms - e["start"]; w = e.get("warn", 45) * 1000; d = e.get("dur", 30) * 1000
    if t < 0: return "calm"
    if t < w: return "warning"
    if t < w + d: return "blowout"
    return "calm"

def safe(fn, *a):
    try: return fn(*a)
    except Exception as e: print("Lamp command failed:", e)

def start_hsv(status):
    dps = (status or {}).get("dps", {})
    try:
        if dps.get("21") == "colour" and len(dps.get("24", "")) == 12:
            h = int(dps["24"][0:4], 16) / 360; s = int(dps["24"][4:8], 16) / 1000; v = int(dps["24"][8:12], 16) / 1000
            return (h, s, max(v, 0.2))
    except Exception:
        pass
    return (0.09, 0.25, 1.0)  # warm white

def restore(before):
    dps = (before or {}).get("dps", {})
    keep = {k: v for k, v in dps.items() if k in ("20", "21", "22", "23", "24", "25", "1", "2", "3", "4", "5")}
    safe(bulb.set_multiple_values, keep)

def lerp(a, b, f): return a + (b - a) * f

print("Lamp:", dev.get("name"), "- waiting for an emission on the website. Keep this window open.")
seen = None
while True:
    e = dict(current); now = time.time() * 1000
    if phase(e, now) == "calm" or e.get("id") == seen:
        time.sleep(0.4); continue
    seen = eid = e["id"]
    print(time.strftime("%H:%M:%S"), "Emission warning: turning red.")
    before = safe(bulb.status)
    safe(bulb.turn_on)
    h0, s0, v0 = start_hsv(before)
    warn_start = e["start"]; blow_start = e["start"] + e.get("warn", 45) * 1000
    plan = [blow_start + ms for ms in strikes(eid, e.get("dur", 30) * 1000)]
    red_set = False; announced = False
    while True:
        e2 = dict(current); now = time.time() * 1000
        if e2.get("id") != eid or phase(e2, now) == "calm": break
        if now < blow_start:
            f = min(1.0, max(0.0, (now - warn_start) / (FADE_SECONDS * 1000)))
            if f < 1.0:
                safe(bulb.set_hsv, lerp(h0, RED[0], f) if abs(h0 - 1) > abs(h0) else lerp(h0, 1.0, f) % 1.0, lerp(s0, RED[1], f), lerp(v0, RED[2], f))
                time.sleep(0.4)
            else:
                if not red_set: safe(bulb.set_hsv, *RED); red_set = True
                time.sleep(0.2)
            continue
        if not announced:
            print(time.strftime("%H:%M:%S"), "Blowout: lightning at", len(plan), "moments."); announced = True
            safe(bulb.set_hsv, *RED)
        if plan and now >= plan[0] - 60:
            plan.pop(0)
            safe(bulb.set_hsv, *LIGHTNING); time.sleep(0.12)
            safe(bulb.set_hsv, *RED); time.sleep(0.09)
            safe(bulb.set_hsv, *LIGHTNING); time.sleep(0.08)
            safe(bulb.set_hsv, *RED)
            continue
        time.sleep(0.05)
    print(time.strftime("%H:%M:%S"), "Emission over, lamp back to normal.")
    restore(before)
