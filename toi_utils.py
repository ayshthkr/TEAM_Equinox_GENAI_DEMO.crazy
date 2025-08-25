import urllib.request
from urllib.error import URLError, HTTPError
from bs4 import BeautifulSoup
import json

BASE_URL = "https://timesofindia.indiatimes.com/india"

def get_cms_links(url=BASE_URL):
    """Scrape .cms article links from the main India page before 'End of Article' marker."""
    cms_links = []
    try:
        with urllib.request.urlopen(url) as response:
            if response.status == 200 and "text/html" in response.getheader("Content-Type", ""):
                html = response.read().decode("utf-8")
                soup = BeautifulSoup(html, "html.parser")

                for tag in soup.find_all(["a", "span"]):
                    if tag.name == "a" and tag.has_attr("href"):
                        if tag["href"].endswith(".cms") and tag["href"].startswith(BASE_URL):
                            cms_links.append(tag["href"])

                    if (
                        tag.name == "span"
                        and "id-r-component" in tag.get("class", [])
                        and tag.get_text(strip=True).lower() == "end of article"
                    ):
                        break
            else:
                print("Not scrapable: content type is not HTML or bad status")
    except (HTTPError, URLError) as e:
        print(f"Error fetching {url}: {e}")
    return cms_links


def contentoftoi(url):
    """Extract clean article text from a TOI .cms article page."""
    try:
        with urllib.request.urlopen(url) as response:
            if response.status == 200 and "text/html" in response.getheader("Content-Type", ""):
                html = response.read().decode("utf-8")
                soup = BeautifulSoup(html, "html.parser")

                body = soup.body
                if body:
                    bad_classes = [
                        "xciRh", "Mivr2 ZwGeW", "Ec__7 AuiwR undefined",
                        "MvyrO  rel", "FNwgv FhCmn"
                    ]
                    for bad in body.find_all(attrs={"class": lambda c: c and any(b in c for b in bad_classes)}):
                        bad.decompose()

                    lines = body.get_text(separator="\n", strip=True).split("\n")
                    article_lines = []
                    for line in lines:
                        if line.strip().lower().startswith("end of article"):
                            break
                        article_lines.append(line)

                    return "\n".join(article_lines)
                else:
                    return "No <body> tag found"
            else:
                return "Not scrapable: content type is not HTML or bad status"
    except (HTTPError, URLError) as e:
        return f"Error fetching article: {e}"


def scrape_and_export():
    """Scrape all .cms articles and export them to JSON."""
    cms_links = get_cms_links()
    print(f"Found {len(cms_links)} article links.")

    articles = []
    for link in cms_links:
        print(f"Scraping: {link}")
        text = contentoftoi(link)
        articles.append({"url": link, "content": text})
    print(len(articles))    
    print(articles)
    return articles


if __name__ == "__main__":
    scrape_and_export()
