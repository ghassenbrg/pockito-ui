pipeline {
  agent any

  options {
    ansiColor('xterm')
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  environment {
    // ---- Change these for your registry / image naming ----
    REGISTRY      = 'docker.io'
    DOCKER_ORG    = 'ghassenbrg'
    IMAGE_NAME    = 'pockito-ui'
    // Tag: branch-sha or "latest" for main
    GIT_SHA       = "${env.GIT_COMMIT?.take(7) ?: ''}"
    BRANCH_SAFE   = "${env.BRANCH_NAME?.replaceAll('[^a-zA-Z0-9_.-]','-') ?: 'local'}"
    IMAGE_TAG     = "${BRANCH_SAFE}-${GIT_SHA}"
    FULL_IMAGE    = "${REGISTRY}/${DOCKER_ORG}/${IMAGE_NAME}:${IMAGE_TAG}"
    LATEST_IMAGE  = "${REGISTRY}/${DOCKER_ORG}/${IMAGE_NAME}:latest"

    // Jenkins credentials ID for Docker Hub (set in Jenkins > Credentials)
    DOCKERHUB_CREDS = 'dockerhub-creds'
  }

  triggers {
    // uncomment if you want auto-builds (polling example)
    // pollSCM('H/5 * * * *')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        sh 'git --version || true'
        sh 'echo "Branch: ${BRANCH_NAME}  Commit: ${GIT_COMMIT}"'
      }
    }

    stage('Node & Dependency Install') {
      steps {
        // If you have Jenkins NodeJS plugin, you can wrap with `nodejs('Node 20')`
        sh '''
          node -v || true
          npm -v || true
          npm ci --prefer-offline --no-audit --no-fund
        '''
      }
    }

    stage('Build (Angular)') {
      steps {
        sh '''
          # Ensure build script exists; otherwise fail loud
          jq -r '.scripts.build // empty' package.json >/dev/null 2>&1 || {
            echo "❌ No \\"build\\" script defined in package.json"; exit 1;
          }
          npm run build
        '''
      }
    }

    stage('Detect dist path from angular.json') {
      steps {
        script {
          // Parse angular.json to discover the outputPath; fallback to dist/<project>/browser
          def distDir = sh(
            script: '''
              node -e "const fs=require('fs');
                const a=JSON.parse(fs.readFileSync('angular.json','utf8'));
                const proj=a.defaultProject || Object.keys(a.projects||{})[0];
                if(!proj){ console.error('No projects found in angular.json'); process.exit(2); }
                const out=a.projects?.[proj]?.architect?.build?.options?.outputPath;
                const fallback=`dist/${proj}/browser`;
                console.log(out || fallback);"
            ''',
            returnStdout: true
          ).trim()

          env.DIST_DIR = distDir
          echo "✅ DIST_DIR resolved to: ${env.DIST_DIR}"
        }
      }
    }

    stage('Docker Build (only built assets)') {
      steps {
        sh '''
          echo "Building image: ${FULL_IMAGE}"
          docker version
          # Build using the Dockerfile that copies ONLY ${DIST_DIR} into Nginx
          docker build \
            --build-arg BUILD_CMD="npm run build" \
            --build-arg DIST_DIR="${DIST_DIR}" \
            -t "${FULL_IMAGE}" \
            -f Dockerfile \
            .
        '''
      }
    }

    stage('Docker Push') {
      when {
        anyOf {
          branch 'main'
          branch 'master'
        }
      }
      steps {
        withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDS}", passwordVariable: 'DOCKERHUB_PASS', usernameVariable: 'DOCKERHUB_USER')]) {
          sh '''
            echo "${DOCKERHUB_PASS}" | docker login -u "${DOCKERHUB_USER}" --password-stdin "${REGISTRY}"
            docker push "${FULL_IMAGE}"

            # Also push :latest on main/master
            docker tag "${FULL_IMAGE}" "${LATEST_IMAGE}"
            docker push "${LATEST_IMAGE}"
          '''
        }
      }
    }

    stage('Cleanup') {
      agent any
      steps {
        sh 'docker system prune -f || true'
        deleteDir()
      }
    }
  }

  post {
    success {
      echo "✅ Build OK. Image: ${FULL_IMAGE}"
    }
    failure {
      echo "❌ Build failed."
    }
  }
}
