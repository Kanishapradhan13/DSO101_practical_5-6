pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS 24.0.2' 
    }
    
    environment {
        CI = 'true'
        NODE_ENV = 'production'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                // Git checkout is automatic when using SCM
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm ci' // Use npm ci for faster, reliable builds
            }
        }
        
        stage('Lint') {
            steps {
                echo 'Running linter...'
                script {
                    try {
                        sh 'npm run lint || true' // Don't fail if no lint script
                    } catch (Exception e) {
                        echo 'No lint script found, skipping...'
                    }
                }
            }
        }
        
        stage('Test') {
            steps {
                echo 'Running tests...'
                sh 'npm test'
            }
        }
        
        stage('Build') {
            steps {
                echo 'Building application...'
                sh 'npm run build'
            }
            post {
                success {
                    // Archive build artifacts
                    archiveArtifacts artifacts: 'build/**/*', allowEmptyArchive: true
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    echo "Deploying to environment based on branch: ${env.BRANCH_NAME}"
                    if (env.BRANCH_NAME == 'main') {
                        sh 'npm run deploy:prod'
                    } else {
                        sh 'npm run deploy:stage'
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline completed!'
            // Clean up workspace
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
            // You could add notification steps here
        }
    }
}