
# TEAM Equinox - DEMO.crazy

An AI-powered news analysis platform that aggregates headlines, detects misinformation, highlights media bias, and explains credibility signals - helping readers stay informed and think critically.

<br />
<div align='center'>

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Google Gemini](https://img.shields.io/badge/google%20gemini-8E75B2?style=for-the-badge&logo=google%20gemini&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
</div>



<br />

## Key Features Implemented

- **News Aggregation**: Curated trusted Indian and global sources, fetching fresh articles every 12 hours to avoid spam and overload.  
- **Bias Detection**: Built embedding-based classifiers to label articles on a Left–Center–Right scale, helping users see multiple perspectives.  
- **Misinformation Checks**: Applied NLP and fact-matching to flag sensational language, dubious claims, and possible deepfakes.  
- **Performance**: Focused on accuracy over real-time speed by running batch analysis with model ensembles for higher precision.  
<br />

## Demo

Check out the live demos here:  

- 🌐 **Website**: [Live Demo](https://news-app-pink-three-77.vercel.app/)
- 📱 **Mobile App**: [APK Link](DEMO-CRAZY.apk)  




## Screenshots

**Dashboard I Designed**  
![Dashboard](https://github.com/ayshthkr/TEAM_Equinox_GENAI_DEMO.crazy/blob/dev/website/public/main_1.png?raw=true)


**Website News Feed**  
![Website](https://github.com/ayshthkr/TEAM_Equinox_GENAI_DEMO.crazy/blob/dev/website/public/main_2.png?raw=true)

**Mobile View I Implemented**  
![Mobile](https://github.com/ayshthkr/TEAM_Equinox_GENAI_DEMO.crazy/blob/dev/app/assets/mobile_1.jpeg?raw=true)
![App Reels](https://github.com/ayshthkr/TEAM_Equinox_GENAI_DEMO.crazy/blob/dev/app/assets/mobile_2.jpeg?raw=true)

<br />

## Project Structure

```

TEAM_Equinox_GENAI_DEMO.crazy/
├── server/
│   ├── scrapers/
│   │   ├── thedailyjagran_utils.py
│   │   ├── thehindu_utils.py
│   │   ├── toi_utils.py
│   │   └── thehindustan.py    
│   ├── notebooks/
│   ├── requirements.txt
│   ├── mongo.py
│   ├── topics_to_sources.py
│   └── backend.py    
│
├── website/
│   ├── components/
│   ├── lib/
│   └── app/
│       ├── articles/[id]/page.jsx
│       ├── blindspot/page.jsx
│       ├── for-you/page.jsx
│       ├── tag/[id]/page.jsx
│       ├── top-news/page.jsx
│       └── page.jsx
│
├── app/
│   ├── assets/
│   ├── lib/
│   ├── src/
│   │   ├── articles/[id]/page.jsx
│   │   ├── blindspot/page.jsx
│   │   ├── for-you/page.jsx
│   │   ├── tag/[id]/page.jsx
│   │   ├── top-news/page.jsx
│   │   └── page.jsx
│   ├── package.json
│   └── app.json
│
├── fake-news-pipeline/
│   ├── configs/
│   ├── data/
│   │   ├── external/
│   │   ├── processed/
│   │   ├── raw/
│   │   ├── liar_train.csv
│   │   ├── liar_test.csv
│   │   ├── liar_validation.csv
│   │   ├── processed_liar_dataset.csv
│   │   └── dataset_summary.json
│   ├── 1_pre.ipynb
│   ├── 2_train.ipynb
│   ├── 3_pipeline.ipynb
│   ├── 4_integration.ipynb
│   ├── .env.example
│   ├── main.py
│   └── pipeline.py
│
└── README.md

```




<br />

## Run My Project Locally

Here's how to run all parts of the project on your machine:

```bash
# Clone the repo
git clone https://github.com/ayshthkr/TEAM_Equinox_GENAI_DEMO.crazy
cd TEAM_Equinox_GENAI_DEMO.crazy
````

### 1. Start the FastAPI server

```bash
cd server
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python backend.py
```

Server runs at `http://localhost:8000`

---

### 2. Start the Next.js website

```bash
cd website
cp .env.example .env.local   # Fill in required environment variables
npm install
npm run dev
```

Website runs at `http://localhost:3000`

---

### 3. Start the Expo React Native app

```bash
cd app
npm install
npx expo start
```

Scan the QR code in the Expo terminal output with your phone to open the app.





<br />

## API Reference

This API allows for scraping news articles from various Indian news sources and then fetching or searching them from a database.

-----

#### Scrape Times of India

Scrapes the **Times of India** website and returns a list of news articles.

```http
GET /scrape/toi
```

This endpoint takes no parameters.

-----

#### Scrape Hindustan Times

Scrapes the **Hindustan Times** website for articles.

```http
GET /scrape/hindustan
```

This endpoint takes no parameters.

-----

#### Scrape The Hindu

Scrapes **The Hindu** website for articles.

```http
GET /scrape/hindu
```

This endpoint takes no parameters.

-----

#### Scrape Dainik Jagran

Scrapes the **Dainik Jagran** website for articles.

```http
GET /scrape/jagran
```

This endpoint takes no parameters.

-----

#### Scrape All News Sources

Scrapes all supported news sources in one go and returns the combined results.

```http
GET /scrape/all
```

This endpoint takes no parameters.

-----

#### Get Article by ID

Fetches a single article by its unique MongoDB `_id`.

```http
GET /articles/{article_id}
```

| Parameter      | Type     | Description                                |
| :------------- | :------- | :----------------------------------------- |
| `article_id` | `string` | **Required**. The ID of the article to fetch. |

-----

#### Get Filtered Articles

Fetches a list of articles, with options for filtering and pagination.

```http
POST /articles
```

| Body Field | Type      | Description                                                    |
| :--------- | :-------- | :------------------------------------------------------------- |
| `tags`     | `string[]`  | Optional. A list of tags to filter articles by.                |
| `limit`    | `integer` | Optional. Maximum number of articles to return. Default is `20`. |
| `skip`     | `integer` | Optional. Number of articles to skip for pagination. Default is `0`. |

-----

#### Search Articles

Searches for articles where the query text appears in the headline or content.

```http
POST /article/search
```

| Body Field | Type     | Description                               |
| :--------- | :------- | :---------------------------------------- |
| `query`    | `string` | **Required**. The text to search for. |

-----



##  Unique Project Stats

Here’s a quick snapshot of what powers **DEMO.crazy**:

- ⚡ **9 API endpoints** – powering fast, reliable data flow  
- ⏱️ **5 min scraping cycle** – runs twice a day for fresh content  
- 🧠 **~10 min pipeline** – from embeddings → clustering → ML bias/fake news detection → article generation  
- 💻 **Economical compute** – runs comfortably on a single 8GB VRAM GPU  
- 🌐 **10 website routes** – covering news, analysis, and insights  
- 📱 **4 mobile app screens** – including reels-style news browsing  
- 🔍 **Bias-aware insights** – Left/Center/Right classification with visual cues
- 🧩 **Explainable AI** – highlights why an article may be misleading  




## Authors

This project was developed with ❤️ for The Gen AI Exchange Hackathon by:
- [@ayshthkr (Ayush Thakur)](https://github.com/ayshthkr) - Team Leader
- [@errorui (Raj Raman)](https://github.com/errorui) - Backend, DX & ML dev
- [@ChiragMiglani73 (Chirag Miglani)](https://github.com/ChiragMiglani73) - Frontend(Website) & UI/UX
- [@suryansh9mar (Suryansh)](https://github.com/suryansh9mar) - Frontend(Mobile App) & UI/UX
- [@Sidhanth-Mandal (Sidhanth)](https://github.com/Sidhanth-Mandal) - ML(Bias Gen)
