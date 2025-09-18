import urllib.request
from urllib.error import URLError, HTTPError
from bs4 import BeautifulSoup

BASE_URL = "https://www.thehindu.com/news/national/"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/115.0 Safari/537.36"
    )
}


def get_cms_links_hindu(url: str = BASE_URL):
    """
    Collect all Hindu article links (.ece) from the given section page.
    """
    cms_links = set() 
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req) as response:
            if response.status == 200 and "text/html" in response.getheader("Content-Type", ""):
                html = response.read().decode("utf-8")
                soup = BeautifulSoup(html, "html.parser")

                for a in soup.find_all("a", href=True):
                    if a["href"].endswith(".ece") and a["href"].startswith("https://www.thehindu.com/"):
                        cms_links.add(a["href"])
            else:
                print("Not scrapable: bad status or content type")
    except (HTTPError, URLError) as e:
        print(f"Error fetching {url}: {e}")
    return list(cms_links)


def contentofhindu(url: str):
    """
    Extract article text from a Hindu .ece article page.
    """
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req) as response:
            if response.status == 200 and "text/html" in response.getheader("Content-Type", ""):
                html = response.read().decode("utf-8")
                soup = BeautifulSoup(html, "html.parser")

                target = soup.find("div", class_="container article-section")
                if not target:
                    return {"url": url, "content": None, "error": "No article container found"}

                full_text = target.get_text(separator="\n", strip=True)
                lines = full_text.split("\n")
                article_lines = []
                for line in lines:
                    if line.strip().lower().startswith("end of article"):
                        break
                    article_lines.append(line)

                article_text = "\n".join(article_lines)

                return {"url": url, "content": article_text, "error": None}
            else:
                return {"url": url, "content": None, "error": "Not scrapable"}
    except (HTTPError, URLError) as e:
        return {"url": url, "content": None, "error": str(e)}


def scrape_hindu_news():
    """
    Scrape all Hindu .ece links and return structured results.
    """
    links = get_cms_links_hindu()
    print(f"Found {len(links)} Hindu article links")
    results = []
    for link in links:
        print(f"Scraping: {link}")

        results.append(contentofhindu(link))
    print(len(results))
    
    import pandas as pd
    df = pd.DataFrame(results)
    
    df = df[['url', 'content']]
    df.to_csv('thehindu.csv', index=False)
    print("saved to thehindu.csv")
    
    return results

if __name__ == "__main__":
    scrape_hindu_news()
