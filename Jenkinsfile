pipeline {
  agent none  // we'll pick agents per-stage

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
        // Node + Chrome preinstalled
        docker {
          image 'cypress/browsers:node18.12.0-chrome107'
          // run as root so npm can write cache/node_modules if needed
          args '-u 0:0'
          // reuse workspace across stages
          reuseNode true
        }
      }
      environment {
        // helps Karma/Angular find Chrome in container if needed
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
            // Run lint only if script exists
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
            // Headless Chrome in container; add --no-sandbox if your Karma launcher requires it
            sh 'npm run test -- --watch=false --browsers=ChromeHeadless'
          }
          post {
            always {
              // Adjust glob to your reporter output
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
      // Needs an agent with docker CLI + daemon access
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
  }

  post {
    always {
      // run where post executes; tolerate missing docker access
      sh 'docker system prune -f || true'
      cleanWs()
    }
    success { echo "Pipeline completed successfully for branch: ${env.BRANCH_NAME}" }
    failure { echo "Pipeline failed for branch: ${env.BRANCH_NAME}" }
  }
}
