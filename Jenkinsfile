pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS 24.0.2'
    }
    
    environment {
        CI = 'true'
        NODE_ENV = 'production'
        DOCKER_IMAGE = 'kanishapradhan/my-react-app'
        DOCKER_TAG = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                sh '''
                    echo "Node.js version:"
                    node --version
                    echo "NPM version:"
                    npm --version
                    echo "Installing dependencies..."
                    npm ci
                    echo "Checking installed packages..."
                    npm list --depth=0 || echo "Some peer dependency warnings (normal)"
                '''
            }
        }
        
        stage('Test') {
            steps {
                echo 'Running tests...'
                script {
                    try {
                        // Try to run tests with junit reporter first
                        sh 'npm run test:junit'
                    } catch (Exception e) {
                        echo 'Jest-junit failed, running basic tests...'
                        // Fall back to basic test without junit reporter
                        sh 'npm test'
                    }
                }
            }
            post {
                always {
                    script {
                        // Only try to publish junit results if the file exists
                        if (fileExists('junit.xml')) {
                            echo 'Publishing test results...'
                            junit 'junit.xml'
                        } else {
                            echo 'No junit.xml file found, skipping test result publishing'
                        }
                    }
                }
            }
        }
        
        stage('Build Application') {
            steps {
                echo 'Building React application...'
                sh 'npm run build'
            }
            post {
                success {
                    archiveArtifacts artifacts: 'build/**/*', allowEmptyArchive: true
                }
            }
        }
        
        stage('Build Docker Image') {
            when {
                anyOf {
                    branch 'main'
                    environment name: 'BUILD_DOCKER', value: 'true'
                }
            }
            steps {
                echo 'Building Docker image...'
                script {
                    try {
                        // Try with host network first
                        sh "docker build --network=host -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                        sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
                        echo "Docker image built successfully"
                    } catch (Exception e1) {
                        echo "Docker build with host network failed, trying default network..."
                        try {
                            sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                            sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
                            echo "Docker image built successfully"
                        } catch (Exception e2) {
                            echo "Docker build failed completely: ${e2.getMessage()}"
                            echo "Skipping Docker build due to network issues"
                            currentBuild.result = 'UNSTABLE'
                        }
                    }
                }
            }
        }
        
        stage('Push to Docker Hub') {
            when {
                anyOf {
                    branch 'main'
                    environment name: 'BUILD_DOCKER', value: 'true'
                }
            }
            steps {
                echo 'Pushing Docker image to Docker Hub...'
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                    sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    sh "docker push ${DOCKER_IMAGE}:latest"
                }
            }
        }
        
        stage('Clean Docker Images') {
            when {
                anyOf {
                    branch 'main'
                    environment name: 'BUILD_DOCKER', value: 'true'
                }
            }
            steps {
                echo 'Cleaning up local Docker images...'
                sh """
                    docker rmi ${DOCKER_IMAGE}:${DOCKER_TAG} || true
                    docker rmi ${DOCKER_IMAGE}:latest || true
                    docker system prune -f || true
                """
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "Deploying to production..."
                    sh 'npm run deploy:prod'
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline completed!'
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
            script {
                if (env.BRANCH_NAME == 'main') {
                    echo "Docker image pushed: ${DOCKER_IMAGE}:${DOCKER_TAG}"
                }
            }
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}