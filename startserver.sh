
# Install required Python packages
pip install flask flask_cors deep_translator transformers sentencepiece pdfplumber nltk datasets pdfminer.six spacy Pillow || exit

# Run the main Python script
python3 main.py || exit
