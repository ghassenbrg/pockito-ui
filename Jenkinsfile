pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'ghassenbrg/pockito-ui:1.0.0-SNAPSHOT'
        DOCKER_TAG = "${env.BRANCH_NAME == 'master' ? 'latest' : env.BRANCH_NAME}"
        NODE_VERSION = '18'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Node.js') {
            steps {
                script {
                    // Use Node.js tool configured in Jenkins
                    nodejs(nodeJSInstallationName: 'NodeJS-18') {
                        sh 'node --version'
                        sh 'npm --version'
                    }
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    nodejs(nodeJSInstallationName: 'NodeJS-18') {
                        sh 'npm ci'
                    }
                }
            }
        }
        
        stage('Lint') {
            steps {
                script {
                    nodejs(nodeJSInstallationName: 'NodeJS-18') {
                        sh 'npm run lint'
                    }
                }
            }
        }
        
        stage('Test') {
            steps {
                script {
                    nodejs(nodeJSInstallationName: 'NodeJS-18') {
                        sh 'npm run test -- --watch=false --browsers=ChromeHeadless'
                    }
                }
            }
            post {
                always {
                    publishTestResults testResultsPattern: '**/test-results.xml'
                }
            }
        }
        
        stage('Build') {
            steps {
                script {
                    nodejs(nodeJSInstallationName: 'NodeJS-18') {
                        sh 'npm run build'
                    }
                }
            }
        }
        
        stage('Docker Build') {
            steps {
                script {
                    // Build Docker image
                    docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                }
            }
        }
        
        stage('Docker Push') {
            when {
                anyOf {
                    branch 'master'
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    // Use Docker Hub token for authentication
                    withCredentials([string(credentialsId: 'dockerhub-token', variable: 'DOCKERHUB_TOKEN')]) {
                        sh "echo \"$DOCKERHUB_TOKEN\" | docker login -u ${env.DOCKER_HUB_USERNAME ?: 'ghassenbrg'} --password-stdin"
                        
                        // Tag and push the image
                        sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:${DOCKER_TAG}"
                        sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
                        
                        // If it's master branch, also tag as latest
                        if (env.BRANCH_NAME == 'master') {
                            sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
                            sh "docker push ${DOCKER_IMAGE}:latest"
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            // Clean up Docker images to save space
            sh 'docker system prune -f'
            
            // Clean up workspace
            cleanWs()
        }
        success {
            echo "Pipeline completed successfully for branch: ${env.BRANCH_NAME}"
        }
        failure {
            echo "Pipeline failed for branch: ${env.BRANCH_NAME}"
        }
    }
}
