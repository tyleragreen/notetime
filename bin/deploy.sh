git rm tags/*
git rm timelines/*

node ../notetime/lib/index.js

git add notes/*
git add tags/*
git add timelines/*

git commit -am "Deploy notes"
git push
