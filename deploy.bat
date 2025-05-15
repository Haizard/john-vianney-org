@echo off
echo ===================================
echo Deployment Script for St. John Vianney School System
echo ===================================

echo.
echo Step 1: Adding all changes to git...
git add .

echo.
echo Step 2: Committing changes...
git commit -m "Fix login authentication and CORS issues for deployment"

echo.
echo Step 3: Pushing to GitHub...
git push origin main

echo.
echo Deployment initiated! Changes have been pushed to GitHub.
echo Render will automatically deploy the changes.
echo.
echo Please check the Render dashboard for deployment status.
echo.
echo ===================================
