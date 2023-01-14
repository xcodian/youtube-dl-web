cd src
python -m uvicorn server:app --host 0.0.0.0 --port 4000 --no-server-header --workers 8