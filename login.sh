echo "Logging In"
curl --insecure -v -d "@login.json" POST -H "Content-Type:application/json" http://localhost:3000/login
#curl -v https://dev.stedi.me/validate/e842d655-9412-4988-b32a-510a5dda91eb