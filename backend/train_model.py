import pandas as pd
import joblib
import random
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.pipeline import Pipeline
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# === DATA AUGMENTATION ===
vocab = {
    "food": ["couscous", "brik", "lablabi", "makroudh", "manger", "restaurant", "plat", "cuisine", "thé", "pignons", "faim", "recette", "slata", "ojja"],
    "geography": ["carthage", "sidi bou said", "douz", "sahara", "el jem", "kairouan", "bardo", "tunis", "hammamet", "sousse", "djerba", "mosquée", "musée", "désert", "plage", "gps"],
    "history": ["histoire", "antique", "romain", "phénicien", "ruines", "monument", "fondation", "hannibal", "reine didon", "guerre", "patrimoine", "unesco", "bey", "date"],
    "general": ["bonjour", "salut", "merci", "aurevoir", "ça va", "aide", "nomadia", "hello", "guide", "bot", "qui es tu"]
}

templates = ["{}", "Je veux {}", "Parle moi de {}", "C'est quoi {}", "Où trouver {}", "J'aime {}", "Donne des infos sur {}", "Quelle est l'histoire de {}", "Aller à {}"]

dataset = []
print("🔄 Génération des données synthétiques...")
for intent, keywords in vocab.items():
    for word in keywords:
        for t in templates:
            dataset.append((t.format(word), intent))
            dataset.append((t.format(word).lower(), intent))

df = pd.DataFrame(dataset, columns=['text', 'intent'])
df = df.sample(frac=1, random_state=42).reset_index(drop=True)
print(f"📊 Dataset : {len(df)} phrases.")

# === TRAINING ===
X_train, X_test, y_train, y_test = train_test_split(df['text'], df['intent'], test_size=0.2, random_state=42)

text_clf = Pipeline([
    ('vect', CountVectorizer(ngram_range=(1, 2))),#Transforme text-->chiffre 
    ('tfidf', TfidfTransformer()),#ponderation des mots selon l'importance 
    ('clf', MultinomialNB(alpha=0.1)), #classifie la phrase dans une des 4 intensions
])

print("🧠 Entraînement...")
text_clf.fit(X_train, y_train)

# === EVALUATION ===
acc = accuracy_score(y_test, text_clf.predict(X_test))
print(f"\n✅ PRÉCISION DU MODÈLE : {acc*100:.2f}%")
print(classification_report(y_test, text_clf.predict(X_test)))

joblib.dump(text_clf, 'backend/intent_model.joblib')
print("💾 Modèle sauvegardé.")