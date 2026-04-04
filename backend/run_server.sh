#!/bin/bash
cd /home/ayush/Desktop/code_testing/Satluj-ui/backend
rm -f satluj_users.db
uvicorn main:app --reload --port 8000
