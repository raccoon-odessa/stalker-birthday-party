"""Emission test for a Smart Life (Tuya) bulb, controlled over the local wifi.

Run this from the folder where `python -m tinytuya wizard` saved devices.json.
The bulb turns red, flickers like a blowout, then goes back to how it was.
"""
import json, sys, time
import tinytuya

with open("devices.json", encoding="utf-8") as f:
    devices = json.load(f)
if not devices:
    sys.exit("devices.json is empty. Run: python -m tinytuya wizard")

wanted = sys.argv[1].lower() if len(sys.argv) > 1 else None
dev = next((d for d in devices if not wanted or wanted in d.get("name", "").lower()), None)
if not dev:
    sys.exit("No device matches '%s'. Names found: %s" % (wanted, ", ".join(d.get("name", "?") for d in devices)))

print("Bulb:", dev.get("name"), "| id", dev["id"])
from lamp_connect import connect
bulb = connect(dev)
before = bulb.status()
if not before or "Error" in before:
    sys.exit("Could not reach the bulb on the network: %s\nIs the PC on the same wifi as the bulb?" % before)
print("Reached it. Current state:", before.get("dps"))

try:
    bulb.turn_on()
    bulb.set_colour(255, 0, 0)
    print("Red. Now flickering...")
    for i in range(8):
        bulb.set_brightness_percentage(100)
        time.sleep(0.35 if i % 2 else 0.6)
        bulb.set_brightness_percentage(15)
        time.sleep(0.25)
    bulb.set_brightness_percentage(100)
    time.sleep(2)
finally:
    print("Restoring the previous state...")
    dps = (before or {}).get("dps", {})
    keep = {k: v for k, v in dps.items() if k in ("20", "21", "22", "23", "24", "25", "1", "2", "3", "4", "5")}
    try:
        bulb.set_multiple_values(keep)
    except Exception as e:
        print("Could not fully restore:", e)
print("Done. If the bulb went red and flickered, we're good to build the real thing.")
