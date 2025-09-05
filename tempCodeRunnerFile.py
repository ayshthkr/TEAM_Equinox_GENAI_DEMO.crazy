df=pd.read_csv('annotated_news_articles.csv')
# df=df[df['processing_status'] == 'success']

# # avg column length

# avg = df['text'].str.len().mean()
# print(f"Average text length: {avg:.2f}")
# # print(df.head())
