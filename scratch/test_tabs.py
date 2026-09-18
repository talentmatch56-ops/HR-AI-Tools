import urllib.request
import re

url = "https://docs.google.com/spreadsheets/d/1Eb-hdgR2K9Es3y-INU8YmE5yFGg0I56psxaLYLuILCQ/htmlview"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    # Find all sheet names in script or HTML
    sheet_names = re.findall(r'name[:=]\s*"([^"]+)"', html)
    print("SHEET NAMES:", sheet_names)
    
    # Also search for tab titles in sheet-button
    matches = re.findall(r'id="sheet-button-[^"]+">([^<]+)<', html)
    print("MATCHES:", matches)
    
    # Save a snippet of html to inspect
    with open("scratch/page.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("Saved page.html, size:", len(html))
except Exception as e:
    print("ERROR:", e)
