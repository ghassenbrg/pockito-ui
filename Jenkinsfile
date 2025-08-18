pipeline {
  agent none  // we choose agents per stage

  environment {
    DOCKER_REPO = 'ghassenbrg/pockito-ui'
    DOCKER_TAG  = "${env.BRANCH_NAME == 'master' ? 'latest' : env.BRANCH_NAME}"
    IMAGE       = "${DOCKER_REPO}:${DOCKER_TAG}"
  }

  stages {

    stage('Checkout') {
      agent any
      steps {
        checkout scm
      }
    }

    stage('Install, Lint, Test, Build (Node + Chrome)') {
      agent {
        docker {
          image 'cypress/browsers:node18.12.0-chrome107'
          args '-u 0:0'
          reuseNode true
        }
      }
      environment {
        CHROME_BIN = '/usr/bin/google-chrome'
        PUPPETEER_SKIP_DOWNLOAD = 'true'
      }
      stages {
        stage('Node Versions') {
          steps {
            sh 'node -v'
            sh 'npm -v'
          }
        }

        stage('Install Dependencies') {
          steps {
            sh 'npm ci'
          }
        }

        stage('Lint (if present)') {
          steps {
            sh '''
              if npm run -s | grep -q "^  lint "; then
                npm run lint
              else
                echo "ℹ️  No \\"lint\\" script found in package.json; skipping."
              fi
            '''
          }
        }

        stage('Test') {
          steps {
            // add --no-sandbox if your launcher needs it
            sh 'npm run test -- --watch=false --browsers=ChromeHeadless'
          }
          post {
            always {
              junit testResults: '**/test-results.xml', allowEmptyResults: true
            }
          }
        }

        stage('Build (if present)') {
          steps {
            sh '''
              if npm run -s | grep -q "^  build "; then
                npm run build
              else
                echo "ℹ️  No \\"build\\" script found in package.json; skipping."
              fi
            '''
          }
        }
      }
    }

    stage('Docker Build') {
      // pick a node that has Docker daemon access
      agent any
      steps {
        script {
          docker.build("${env.IMAGE}")
        }
      }
    }

    stage('Docker Push') {
      when { anyOf { branch 'master'; branch 'main'; branch 'develop' } }
      agent any
      steps {
        script {
          withCredentials([string(credentialsId: 'dockerhub-token', variable: 'DOCKERHUB_TOKEN')]) {
            sh """
              echo "\$DOCKERHUB_TOKEN" | docker login -u \${DOCKER_HUB_USERNAME:-ghassenbrg} --password-stdin
              docker push "${IMAGE}"
              if [ "${BRANCH_NAME}" = "master" ]; then
                docker tag "${IMAGE}" "${DOCKER_REPO}:latest"
                docker push "${DOCKER_REPO}:latest"
              fi
            """
          }
        }
      }
    }

    stage('Cleanup') {
      agent any
      steps {
        sh 'docker system prune -f || true'
        cleanWs()
      }
    }
  }

  post {
    success {
      echo "Pipeline completed successfully for branch: ${env.BRANCH_NAME}"
    }
    failure {
      echo "Pipeline failed for branch: ${env.BRANCH_NAME}"
    }
  }
}
