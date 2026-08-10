.PHONY: deploy

deploy:
	@echo "Deploying to Vercel..."
	vercel --prod
