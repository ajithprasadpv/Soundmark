#!/bin/bash

# Generate NextAuth secret
echo "Generating NextAuth secret..."
SECRET=$(openssl rand -base64 32)

echo ""
echo "Add this to your .env.local file:"
echo "NEXTAUTH_SECRET=$SECRET"
echo ""
echo "Also add to Vercel environment variables in production!"
