up:
	docker-compose up
down:
	docker-compose down
build:
	docker build -t gyaon .
in:
	docker-compose -f docker-compose.yml -f docker-compose.local.yml run gyaon /bin/bash
