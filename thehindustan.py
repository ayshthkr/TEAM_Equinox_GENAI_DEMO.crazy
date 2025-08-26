import urllib.request
from urllib.error import URLError, HTTPError
from bs4 import BeautifulSoup
import json

BASE_URL = "https://www.hindustantimes.com/india-news"

def get_cms_links(url=BASE_URL):
    """Scrape .cms article links from the main India page before 'End of Article' marker."""
    cms_links = set() 
    try:
        headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                      "AppleWebKit/537.36 (KHTML, like Gecko) "
                      "Chrome/115.0 Safari/537.36"
    }
        req = urllib.request.Request(url, headers=headers)

        with urllib.request.urlopen(req) as response:
            if response.status == 200 and "text/html" in response.getheader("Content-Type", ""):
                html = response.read().decode("utf-8")
                soup = BeautifulSoup(html, "html.parser")

            
                for a in soup.find_all("a", href=True):
                    if a["href"].endswith(".html") and a["href"].startswith(url):
                        
                        cms_links.add(a["href"])

                print(f"Found {len(cms_links)} links ending with .ece:\n")
                for link in cms_links:
                    print(link)
            else:
                print("Not scrapable: content type is not HTML or bad status")       
    except (HTTPError, URLError) as e:
           print(f"Error fetching {url}: {e}")
    return list(cms_links)


def contentoftoi(url):
    '''takes content of hindustan times article
     Extracts text from main story container (#storyMainDiv)
    - Extracts all image URLs
    - Returns a dict with url, text, images
    '''
    print(url)

 
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                      "AppleWebKit/537.36 (KHTML, like Gecko) "
                      "Chrome/115.0 Safari/537.36"
    }
    req = urllib.request.Request(url, headers=headers)

    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200 and "text/html" in response.getheader("Content-Type", ""):
                html = response.read().decode("utf-8")
                soup = BeautifulSoup(html, "html.parser")

                # ✅ Grab the main article container
                target = soup.find("div", id="storyMainDiv")
                if not target:
                    return {"url": url, "content": None, "images": [], "error": "No article container found"}

                # ---- Extract text ----
                full_text = target.get_text(separator="\n", strip=True)
                lines = full_text.split("\n")
                article_lines = []
                for line in lines:
                    if line.strip().lower().startswith("end of article"):
                        break
                    article_lines.append(line)
                article_text = "\n".join(article_lines)

                # ---- Extract images ----
                img_urls = []
                for img in target.find_all("img"):
                    if img.has_attr("src"):
                        img_urls.append(img["src"])
                    elif img.has_attr("data-src"):  # lazy-loaded images
                        img_urls.append(img["data-src"])

                return {"url": url, "content": article_text, "images": img_urls}

            else:
                return {"url": url, "content": None, "images": [], "error": "Not HTML or bad status"}

    except HTTPError as e:
        return {"url": url, "content": None, "images": [], "error": f"HTTP Error {e.code}"}
    except URLError as e:
        return {"url": url, "content": None, "images": [], "error": f"URL Error {e.reason}"}


def scrape_and_export_hindustan_times():
    """
    Scrape all .cms articles from TOI India page and return a list of dicts:
    [
      { "url": ..., "content": ..., "images": [...], "error": ... },
      ...
    ]
    """
    cms_links = get_cms_links()
    print(f"Found {len(cms_links)} article links.")

    articles = []
    for link in cms_links:
        print(f"Scraping: {link}")
        article_data = contentoftoi(link)  # already returns dict
        articles.append(article_data)
    print(len(articles))    

    import pandas as pd
    df = pd.DataFrame(articles)

    df = df[['url', 'content','images']]
    df.to_csv('thehindustan.csv', index=False)
    print("Saved to hindu.csv")
    
    
    return articles

if __name__ == "__main__":
    scrape_and_export_hindustan_times()
