.PHONY: deploy

deploy:
	@echo "Deploying to Vercel..."
	HOME=$(PWD)/tmp_home vercel --prod --token $(VERCEL_TOKEN)
