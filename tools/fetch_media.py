import csv
import sys
import requests
import os

def get_wiki_data(title):
    summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{title}"
    try:
        res = requests.get(summary_url).json()
        if "title" not in res:
            return "", "", "", "", ""
        
        desc = res.get("extract", "").replace("\n", " ")
        page_url = res.get("content_urls", {}).get("desktop", {}).get("page", "")
        
        image_url = ""
        if "thumbnail" in res:
            image_url = res["thumbnail"].get("source", "")
            
        return desc, page_url, image_url, "Wikimedia Commons", "Public Domain / CC"
    except Exception:
        return "", "", "", "", ""

def main():
    if len(sys.argv) < 3:
        sys.exit(1)
        
    in_file = sys.argv[1]
    out_file = sys.argv[2]
    
    existing = {}
    if os.path.exists(out_file):
        with open(out_file, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                existing[row["name"]] = row

    rows_to_write = []
    fieldnames = []
    
    with open(in_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = list(reader.fieldnames) + ["description", "sourceUrl", "imageUrl", "imageCredit", "imageLicense", "imagePage"]
        
        for row in reader:
            name = row["name"]
            if name in existing and existing[name].get("imageUrl"):
                rows_to_write.append(existing[name])
                continue
                
            title = row["wiki_title"]
            print(f"Fetching: {title}...")
            desc, page_url, img, credit, lic = get_wiki_data(title)
            
            if not img:
                print(f"  -> No image found for {title}")
                
            row["description"] = desc
            row["sourceUrl"] = page_url
            row["imageUrl"] = img
            row["imageCredit"] = credit
            row["imageLicense"] = lic
            row["imagePage"] = page_url
            rows_to_write.append(row)

    with open(out_file, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows_to_write)
    print("Done!")

if __name__ == "__main__":
    main()