"""Finds the lamp on the Wi-Fi. Tries the saved IP first, then searches the network,
then asks you to type the IP. A working IP is saved to lamp_ip.txt for next time."""
import json, os, time
import tinytuya

IP_FILE = "lamp_ip.txt"
VERSIONS = (3.5, 3.4, 3.3, 3.2, 3.1)

def _works(dev, ip, ver):
    b = tinytuya.BulbDevice(dev["id"], address=ip, local_key=dev["key"], version=ver)
    b.set_socketTimeout(3)
    st = b.status()
    if isinstance(st, dict) and "dps" in st:
        return b
    return None

def _try_ip(dev, ip, ver=None):
    for v in ([ver] if ver else []) + [x for x in VERSIONS if x != ver]:
        try:
            b = _works(dev, ip, v)
            if b:
                return b
        except Exception:
            pass
    return None

def _local(ip):
    """Only home-network addresses. The cloud reports the internet IP, which never answers."""
    try:
        a, b = [int(x) for x in ip.split(".")[:2]]
    except Exception:
        return False
    return a == 10 or (a == 192 and b == 168) or (a == 172 and 16 <= b <= 31)

def _save(ip):
    with open(IP_FILE, "w", encoding="utf-8") as f:
        f.write(ip)

def connect(dev):
    saved = []
    if os.path.exists(IP_FILE):
        saved.append(open(IP_FILE, encoding="utf-8").read().strip())
    if dev.get("ip") and dev["ip"].count(".") == 3:
        saved.append(dev["ip"])
    for ip in [s for s in saved if s and _local(s)]:
        print("Trying the lamp at", ip, "...")
        b = _try_ip(dev, ip)
        if b:
            _save(ip); print("Lamp found at", ip); return b

    for attempt in range(1, 4):
        print("Searching the Wi-Fi for the lamp (attempt %d of 3, takes ~10 s)..." % attempt)
        try:
            found = tinytuya.find_device(dev["id"])
        except Exception:
            found = {}
        ip = (found or {}).get("ip")
        if ip:
            ver = float(found.get("version") or 0) or None
            b = _try_ip(dev, ip, ver)
            if b:
                _save(ip); print("Lamp found at", ip); return b
        time.sleep(2)

    print()
    print("Couldn't find the lamp automatically. Check:")
    print("  1. The lamp is switched on at the wall and works in the Smart Life app.")
    print("  2. This PC is on the same Wi-Fi as the lamp (not a guest network).")
    print("  3. If Windows asked about Python and the firewall, allow it on Private networks.")
    print("  4. Close the Smart Life app on your phone (it can hog the lamp).")
    print()
    print("Or type the lamp's IP address. Find it in your router's list of devices")
    print("(fritz.box -> Heimnetz -> Netzwerk); it is usually named after the lamp or 'ESP'/'Tuya'.")
    while True:
        ip = input("Lamp IP (or just Enter to search again): ").strip()
        if not ip:
            return connect(dev)
        b = _try_ip(dev, ip)
        if b:
            _save(ip); print("Lamp found at", ip); return b
        print("No answer from", ip, "- check the address and try again.")
