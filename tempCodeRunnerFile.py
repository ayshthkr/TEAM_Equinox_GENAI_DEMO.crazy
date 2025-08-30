   recent_docs = [
        d for d in docs if d.get("createdAt") is not None and datetime.fromisoformat(d.get("createdAt")) >= cutoff
    ]