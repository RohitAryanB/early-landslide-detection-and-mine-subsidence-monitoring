#!/usr/bin/env python3
"""
MINEGUARD ESP32 Serial-to-Web Bridge
------------------------------------
Reads the USB Serial stream from the ESP32 node (running mine_node_combined.ino)
and forwards real-time telemetry to the MINEGUARD local server.

Usage:
  python3 serial_bridge.py /dev/ttyUSB0
  python3 serial_bridge.py COM3
"""

import sys
import time
import re
import urllib.request
import json

DEFAULT_PORT = '/dev/ttyUSB0' if sys.platform != 'win32' else 'COM3'
BAUD_RATE = 115200
API_URL = 'http://localhost:5173/api/telemetry'

def parse_lora_line(line):
    # Format: BAT:3.92,VIB:0,RAIN:1,SOIL:2100,POT:1250,AZ:9.80,ALERT:0
    data = {}
    tokens = line.split(',')
    for t in tokens:
        if ':' in t:
            k, v = t.split(':', 1)
            k = k.strip().upper()
            try:
                val = float(v.strip())
                if k == 'BAT': data['batteryV'] = val
                elif k == 'VIB': data['vibration'] = int(val)
                elif k == 'RAIN': data['rainDigital'] = int(val)
                elif k == 'SOIL': data['soilAnalog'] = int(val)
                elif k == 'POT': data['slidePotVal'] = int(val)
                elif k == 'AZ': data['accelZ'] = val
                elif k == 'ALERT': data['alert'] = int(val)
            except ValueError:
                pass
    return data if data else None

def main():
    port = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_PORT
    print(f"==================================================")
    print(f"MINEGUARD ESP32 Serial Bridge")
    print(f"Connecting to port: {port} at {BAUD_RATE} baud...")
    print(f"Forwarding to: {API_URL}")
    print(f"==================================================")

    try:
        import serial
    except ImportError:
        print("\nNote: 'pyserial' package is required for this python script.")
        print("Run: pip install pyserial")
        print("\n(Tip: You can also use the Web Serial button directly in the web browser without installing anything!)\n")
        sys.exit(1)

    try:
        ser = serial.Serial(port, BAUD_RATE, timeout=1)
        print(f"Connected to {port} successfully! Listening for telemetry...\n")
    except Exception as e:
        print(f"Error opening serial port {port}: {e}")
        print("Please check that the ESP32 is plugged in and you selected the correct port.")
        sys.exit(1)

    # Accumulate multiline serial outputs or LoRa packets
    current_readings = {}
    try:
        while True:
            line = ser.readline().decode('utf-8', errors='ignore').strip()
            if not line:
                continue

            print(f"[ESP32 RAW]: {line}")

            # Check if line is LoRa compact packet
            if line.startswith('BAT:') and ',VIB:' in line:
                parsed = parse_lora_line(line)
                if parsed:
                    parsed['rawString'] = line
                    parsed['source'] = 'lora_gateway'
                    send_to_server(parsed)
                continue

            # Check multiline serial print format
            # Accelerometer
            m_acc = re.search(r'Accel X:\s*([\-\d\.]+)\s*Y:\s*([\-\d\.]+)\s*Z:\s*([\-\d\.]+)', line)
            if m_acc:
                current_readings['accelX'] = float(m_acc.group(1))
                current_readings['accelY'] = float(m_acc.group(2))
                current_readings['accelZ'] = float(m_acc.group(3))

            # Vibration
            if 'Vibration:' in line:
                m = re.search(r'Vibration:\s*(\d+)', line)
                if m: current_readings['vibration'] = int(m.group(1))

            # Slide pot
            if 'Slide pot:' in line:
                m = re.search(r'Slide pot:\s*(\d+)', line)
                if m: current_readings['slidePotVal'] = int(m.group(1))

            # Soil AO
            if 'Soil AO:' in line:
                m = re.search(r'Soil AO:\s*(\d+)', line)
                if m: current_readings['soilAnalog'] = int(m.group(1))

            # Rain
            if 'Rain DO:' in line:
                m = re.search(r'Rain DO:\s*(\d+)\s*AO:\s*(\d+)', line)
                if m:
                    current_readings['rainDigital'] = int(m.group(1))
                    current_readings['rainAnalog'] = int(m.group(2))

            # Battery
            if 'Battery:' in line:
                m = re.search(r'Battery:\s*([\d\.]+)V', line)
                if m:
                    current_readings['batteryV'] = float(m.group(1))
                    # End of one cycle, forward to MINEGUARD
                    current_readings['source'] = 'usb_serial'
                    current_readings['rawString'] = f"Pot:{current_readings.get('slidePotVal')}, Vib:{current_readings.get('vibration')}, Soil:{current_readings.get('soilAnalog')}, Batt:{current_readings.get('batteryV')}V"
                    send_to_server(current_readings)
                    current_readings = {}

    except KeyboardInterrupt:
        print("\nStopping serial bridge...")
        ser.close()

def send_to_server(payload):
    try:
        data_bytes = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(API_URL, data=data_bytes, headers={'Content-Type': 'application/json'}, method='POST')
        with urllib.request.urlopen(req, timeout=2) as resp:
            print(f" -> Forwarded to MINEGUARD: {payload.get('rawString') or payload}")
    except Exception as e:
        print(f" -> Failed to send to {API_URL}: {e}")

if __name__ == '__main__':
    main()
