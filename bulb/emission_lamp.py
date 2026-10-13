"""Party mode: the lamp follows the site's emission alarm.
Keep this window open during the party. Ctrl+C or closing the window stops it."""
import json, random, sys, threading, time, urllib.error, urllib.request
import tinytuya

PROJECT = "stalker-birthday"
API_KEY = "AIzaSyBHWToXlYs8Fd4kQC6oaUuFlMsl1FSVDQs"
URL = ("https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents/config/emission?key=%s" % (PROJECT, API_KEY))

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

def phase(e):
    if not e.get("id") or e.get("stopped") or not e.get("start"): return "calm", 0
    t = time.time() * 1000 - e["start"]
    w = e.get("warn", 45) * 1000; d = e.get("dur", 30) * 1000
    if t < 0: return "calm", 0
    if t < w: return "warning", (w - t) / 1000
    if t < w + d: return "blowout", (w + d - t) / 1000
    return "calm", 0

def safe(fn, *a):
    try: return fn(*a)
    except Exception as e: print("Lamp command failed:", e)

def restore(before):
    dps = (before or {}).get("dps", {})
    keep = {k: v for k, v in dps.items() if k in ("20", "21", "22", "23", "24", "25", "1", "2", "3", "4", "5")}
    safe(bulb.set_multiple_values, keep)

print("Lamp:", dev.get("name"), "- waiting for an emission on the website. Keep this window open.")
seen = None
while True:
    ph, _ = phase(current)
    if ph == "calm":
        time.sleep(0.5); continue
    eid = current.get("id")
    if eid == seen:
        time.sleep(0.5); continue
    seen = eid
    print(time.strftime("%H:%M:%S"), "Emission!")
    before = safe(bulb.status)
    safe(bulb.turn_on)
    safe(bulb.set_colour, 255, 0, 0)
    high = True
    while True:
        e = dict(current)
        if e.get("id") != eid: break
        ph, left = phase(e)
        if ph == "calm": break
        if ph == "warning":
            # slow red pulse, getting faster as shelter time runs out
            safe(bulb.set_brightness_percentage, 100 if high else 20)
            high = not high
            time.sleep(1.2 if left > 15 else 0.6)
        else:
            # the blowout: red and orange flicker
            if random.random() < 0.5: safe(bulb.set_colour, 255, random.choice((0, 30, 70)), 0)
            safe(bulb.set_brightness_percentage, random.choice((10, 35, 60, 100)))
            time.sleep(random.uniform(0.3, 0.6))
    print(time.strftime("%H:%M:%S"), "Emission over, lamp back to normal.")
    restore(before)
