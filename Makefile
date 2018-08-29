up:
	docker-compose up
down:
	docker-compose down
build:
	docker build -t gyaon .
in:
	docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d
	docker exec -it gyaon /bin/bash
start:
	npx node dist/app.js
dev: build-js watch
	DEBUG=* npx node-dev dist/app.js
build-js: build-src
	npx browserify dist/assets/app.js -t babelify -o public/javascripts/app.js --debug
build-src:
	npx babel src --out-dir dist --source-map
watch:
	npx babel src --out-dir dist --source-map --watch &
	npx watchify dist/assets/app.js -o public/javascripts/app.js --debug --verbose &
