

build:
	mkdir -p build
	cp public/index.html build/
	cp -r public/css build/
	npm run browserify

clean:
	rm -rf build

start:
	npm run dev


.PHONY: build
