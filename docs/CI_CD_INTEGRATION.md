# CI/CD Integration Guide for Spot Testing

This guide provides examples and best practices for integrating Random Parity Spot Testing into various CI/CD systems.

## GitHub Actions

### Basic Integration

```yaml
name: Spot Test Parity

on: [push, pull_request]

jobs:
  spot-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: sudo apt-get install -y frotz
      - run: npx tsx scripts/spot-test-parity.ts --ci --threshold 95
```

### Advanced Integration with Matrix Testing

```yaml
name: Comprehensive Spot Testing

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  spot-test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest]
        node-version: [18, 20]
        test-mode: [quick, standard, thorough]
        exclude:
          - os: macos-latest
            test-mode: thorough
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Z-Machine interpreter
        run: |
          if [[ "$RUNNER_OS" == "Linux" ]]; then
            sudo apt-get update && sudo apt-get install -y frotz
          elif [[ "$RUNNER_OS" == "macOS" ]]; then
            brew install frotz
          fi
      
      - name: Run spot test
        run: |
          case "${{ matrix.test-mode }}" in
            quick) npx tsx scripts/spot-test-parity.ts --quick --threshold 90 ;;
            standard) npx tsx scripts/spot-test-parity.ts --ci --threshold 95 ;;
            thorough) npx tsx scripts/spot-test-parity.ts --thorough --threshold 98 ;;
          esac
        env:
          SPOT_TEST_VERBOSE: true
      
      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: spot-test-${{ matrix.os }}-node${{ matrix.node-version }}-${{ matrix.test-mode }}
          path: spot-test-results.*
```

### Conditional Testing Based on Changes

```yaml
name: Smart Spot Testing

on: [push, pull_request]

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      game-logic: ${{ steps.changes.outputs.game-logic }}
      parser: ${{ steps.changes.outputs.parser }}
      ui: ${{ steps.changes.outputs.ui }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v2
        id: changes
        with:
          filters: |
            game-logic:
              - 'src/game/**'
              - 'src/engine/**'
            parser:
              - 'src/parser/**'
            ui:
              - 'src/io/**'

  spot-test-game-logic:
    needs: detect-changes
    if: needs.detect-changes.outputs.game-logic == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: sudo apt-get install -y frotz
      - run: npx tsx scripts/spot-test-parity.ts --focus underground,puzzles --commands 100

  spot-test-parser:
    needs: detect-changes
    if: needs.detect-changes.outputs.parser == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: sudo apt-get install -y frotz
      - run: npx tsx scripts/spot-test-parity.ts --types communication,puzzle_action --strict
```

## Jenkins

### Declarative Pipeline

```groovy
pipeline {
    agent any
    
    parameters {
        choice(
            name: 'TEST_MODE',
            choices: ['quick', 'standard', 'thorough'],
            description: 'Spot test mode to run'
        )
        string(
            name: 'COMMAND_COUNT',
            defaultValue: '50',
            description: 'Number of commands to execute'
        )
        string(
            name: 'SEED',
            defaultValue: '',
            description: 'Random seed for reproducible testing'
        )
    }
    
    environment {
        NODE_VERSION = '18'
        SPOT_TEST_VERBOSE = 'true'
    }
    
    stages {
        stage('Setup') {
            steps {
                // Install Node.js
                sh '''
                    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
                    sudo apt-get install -y nodejs
                '''
                
                // Install dependencies
                sh 'npm ci'
                
                // Install Z-Machine interpreter
                sh 'sudo apt-get update && sudo apt-get install -y frotz'
            }
        }
        
        stage('Verify Setup') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'frotz -h || echo "Frotz installed"'
                sh 'ls -la COMPILED/zork1.z3'
            }
        }
        
        stage('Spot Test') {
            steps {
                script {
                    def testArgs = "--${params.TEST_MODE} --output junit --verbose"
                    
                    if (params.COMMAND_COUNT != '50') {
                        testArgs += " --commands ${params.COMMAND_COUNT}"
                    }
                    
                    if (params.SEED != '') {
                        testArgs += " --seed ${params.SEED}"
                    }
                    
                    sh "npx tsx scripts/spot-test-parity.ts ${testArgs}"
                }
            }
            post {
                always {
                    // Archive test results
                    archiveArtifacts artifacts: 'spot-test-results.*', allowEmptyArchive: true
                    
                    // Publish JUnit results if available
                    publishTestResults testResultsPattern: 'spot-test-results.xml'
                }
            }
        }
        
        stage('Analysis') {
            when {
                expression {
                    return fileExists('spot-test-results.json')
                }
            }
            steps {
                script {
                    def results = readJSON file: 'spot-test-results.json'
                    def parityScore = results.summary.parityScore
                    def recommendDeep = results.summary.recommendDeepAnalysis
                    
                    echo "Parity Score: ${parityScore}%"
                    echo "Recommend Deep Analysis: ${recommendDeep}"
                    
                    if (recommendDeep) {
                        currentBuild.result = 'UNSTABLE'
                        echo "⚠️ Issues detected - consider running comprehensive tests"
                    }
                    
                    // Set build description
                    currentBuild.description = "Parity: ${parityScore}%"
                }
            }
        }
    }
    
    post {
        always {
            // Clean up
            sh 'rm -f *.log'
        }
        
        failure {
            // Notify on failure
            emailext (
                subject: "Spot Test Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "Spot test failed. Check console output for details.",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
        
        unstable {
            // Notify on issues detected
            emailext (
                subject: "Spot Test Issues: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "Spot test detected issues. Consider running comprehensive tests.",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
    }
}
```

### Scripted Pipeline with Parallel Execution

```groovy
node {
    stage('Checkout') {
        checkout scm
    }
    
    stage('Setup') {
        sh 'npm ci'
        sh 'sudo apt-get update && sudo apt-get install -y frotz'
    }
    
    stage('Parallel Spot Tests') {
        parallel(
            "Quick Test": {
                sh 'npx tsx scripts/spot-test-parity.ts --quick --output json > quick-results.json'
                archiveArtifacts 'quick-results.json'
            },
            "Standard Test": {
                sh 'npx tsx scripts/spot-test-parity.ts --ci --output json > standard-results.json'
                archiveArtifacts 'standard-results.json'
            },
            "Parser Focus": {
                sh 'npx tsx scripts/spot-test-parity.ts --types communication,puzzle_action --output json > parser-results.json'
                archiveArtifacts 'parser-results.json'
            }
        )
    }
    
    stage('Aggregate Results') {
        script {
            def allPassed = true
            def results = []
            
            ['quick', 'standard', 'parser'].each { testType ->
                if (fileExists("${testType}-results.json")) {
                    def result = readJSON file: "${testType}-results.json"
                    results.add([
                        type: testType,
                        parity: result.summary.parityScore,
                        issues: result.summary.recommendDeepAnalysis
                    ])
                    
                    if (result.summary.parityScore < 90) {
                        allPassed = false
                    }
                }
            }
            
            // Generate summary
            def summary = "Spot Test Results:\n"
            results.each { result ->
                summary += "- ${result.type}: ${result.parity}% ${result.issues ? '⚠️' : '✅'}\n"
            }
            
            echo summary
            currentBuild.description = summary.replace('\n', ' | ')
            
            if (!allPassed) {
                currentBuild.result = 'FAILURE'
            }
        }
    }
}
```

## GitLab CI

### Basic Configuration

```yaml
# .gitlab-ci.yml
stages:
  - setup
  - test
  - report

variables:
  NODE_VERSION: "18"
  SPOT_TEST_VERBOSE: "true"

cache:
  paths:
    - node_modules/

setup:
  stage: setup
  image: node:${NODE_VERSION}
  before_script:
    - apt-get update && apt-get install -y frotz
  script:
    - npm ci
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour

spot-test-quick:
  stage: test
  image: node:${NODE_VERSION}
  dependencies:
    - setup
  before_script:
    - apt-get update && apt-get install -y frotz
  script:
    - npx tsx scripts/spot-test-parity.ts --quick --output json
  artifacts:
    reports:
      junit: spot-test-results.xml
    paths:
      - spot-test-results.*
    expire_in: 1 week
  only:
    - merge_requests
    - develop

spot-test-standard:
  stage: test
  image: node:${NODE_VERSION}
  dependencies:
    - setup
  before_script:
    - apt-get update && apt-get install -y frotz
  script:
    - npx tsx scripts/spot-test-parity.ts --ci --threshold 95 --output json
  artifacts:
    reports:
      junit: spot-test-results.xml
    paths:
      - spot-test-results.*
    expire_in: 1 week
  only:
    - main
    - master

spot-test-thorough:
  stage: test
  image: node:${NODE_VERSION}
  dependencies:
    - setup
  before_script:
    - apt-get update && apt-get install -y frotz
  script:
    - npx tsx scripts/spot-test-parity.ts --thorough --threshold 98 --output json
  artifacts:
    reports:
      junit: spot-test-results.xml
    paths:
      - spot-test-results.*
    expire_in: 1 week
  only:
    - schedules
  when: manual

generate-report:
  stage: report
  image: node:${NODE_VERSION}
  dependencies:
    - spot-test-quick
    - spot-test-standard
  script:
    - |
      echo "# Spot Test Report" > report.md
      echo "" >> report.md
      
      if [ -f "spot-test-results.json" ]; then
        PARITY=$(jq -r '.summary.parityScore' spot-test-results.json)
        ISSUES=$(jq -r '.summary.recommendDeepAnalysis' spot-test-results.json)
        
        echo "**Parity Score:** ${PARITY}%" >> report.md
        echo "**Issues Detected:** ${ISSUES}" >> report.md
        
        if [ "$ISSUES" = "true" ]; then
          echo "" >> report.md
          echo "⚠️ **Recommendation:** Run comprehensive parity tests" >> report.md
        fi
      fi
  artifacts:
    paths:
      - report.md
    expire_in: 1 week
```

### Advanced GitLab CI with Dynamic Configuration

```yaml
# .gitlab-ci.yml
include:
  - template: Code-Quality.gitlab-ci.yml

variables:
  NODE_VERSION: "18"
  SPOT_TEST_IMAGE: "node:${NODE_VERSION}"

.spot-test-base: &spot-test-base
  image: $SPOT_TEST_IMAGE
  before_script:
    - apt-get update && apt-get install -y frotz jq bc
    - npm ci
  cache:
    paths:
      - node_modules/
  artifacts:
    reports:
      junit: spot-test-results.xml
    paths:
      - spot-test-results.*
    expire_in: 1 week

spot-test:quick:
  <<: *spot-test-base
  stage: test
  script:
    - npx tsx scripts/spot-test-parity.ts --quick --output junit --verbose
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == "develop"

spot-test:standard:
  <<: *spot-test-base
  stage: test
  script:
    - npx tsx scripts/spot-test-parity.ts --ci --threshold 95 --output junit --verbose
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

spot-test:focused:
  <<: *spot-test-base
  stage: test
  parallel:
    matrix:
      - FOCUS_AREA: ["house", "forest", "underground", "puzzles"]
        COMMAND_TYPE: ["movement", "examination", "object_interaction"]
  script:
    - npx tsx scripts/spot-test-parity.ts --focus $FOCUS_AREA --types $COMMAND_TYPE --commands 50 --output json
  rules:
    - if: $CI_PIPELINE_SOURCE == "schedule"

spot-test:analysis:
  image: $SPOT_TEST_IMAGE
  stage: .post
  dependencies:
    - spot-test:quick
    - spot-test:standard
  script:
    - |
      # Analyze all test results
      TOTAL_TESTS=0
      PASSED_TESTS=0
      
      for result_file in spot-test-results*.json; do
        if [ -f "$result_file" ]; then
          TOTAL_TESTS=$((TOTAL_TESTS + 1))
          PARITY=$(jq -r '.summary.parityScore // 0' "$result_file")
          
          if [ "$(echo "$PARITY >= 90" | bc -l)" = "1" ]; then
            PASSED_TESTS=$((PASSED_TESTS + 1))
          fi
        fi
      done
      
      echo "Tests passed: $PASSED_TESTS/$TOTAL_TESTS"
      
      if [ $PASSED_TESTS -lt $TOTAL_TESTS ]; then
        echo "Some spot tests failed"
        exit 1
      fi
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```

## Azure DevOps

### Azure Pipelines YAML

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - main
      - develop
  paths:
    include:
      - src/*
      - scripts/*
      - package*.json

pr:
  branches:
    include:
      - main
      - develop

variables:
  nodeVersion: '18.x'
  spotTestVerbose: true

stages:
- stage: SpotTest
  displayName: 'Spot Test Parity'
  jobs:
  - job: SpotTestMatrix
    displayName: 'Spot Test Matrix'
    strategy:
      matrix:
        Quick_Ubuntu:
          imageName: 'ubuntu-latest'
          testMode: 'quick'
          threshold: 90
        Standard_Ubuntu:
          imageName: 'ubuntu-latest'
          testMode: 'standard'
          threshold: 95
        Quick_macOS:
          imageName: 'macOS-latest'
          testMode: 'quick'
          threshold: 90
    
    pool:
      vmImage: $(imageName)
    
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: $(nodeVersion)
      displayName: 'Install Node.js'
    
    - script: npm ci
      displayName: 'Install dependencies'
    
    - script: |
        if [ "$AGENT_OS" = "Linux" ]; then
          sudo apt-get update && sudo apt-get install -y frotz
        elif [ "$AGENT_OS" = "Darwin" ]; then
          brew install frotz
        fi
      displayName: 'Install Z-Machine interpreter'
    
    - script: |
        case "$(testMode)" in
          quick) npx tsx scripts/spot-test-parity.ts --quick --threshold $(threshold) --output junit ;;
          standard) npx tsx scripts/spot-test-parity.ts --ci --threshold $(threshold) --output junit ;;
          thorough) npx tsx scripts/spot-test-parity.ts --thorough --threshold $(threshold) --output junit ;;
        esac
      displayName: 'Run spot test'
      env:
        SPOT_TEST_VERBOSE: $(spotTestVerbose)
    
    - task: PublishTestResults@2
      condition: always()
      inputs:
        testResultsFormat: 'JUnit'
        testResultsFiles: 'spot-test-results.xml'
        testRunTitle: 'Spot Test $(testMode) on $(imageName)'
    
    - task: PublishBuildArtifacts@1
      condition: always()
      inputs:
        pathToPublish: 'spot-test-results.json'
        artifactName: 'spot-test-$(testMode)-$(imageName)'

- stage: Analysis
  displayName: 'Result Analysis'
  dependsOn: SpotTest
  condition: always()
  jobs:
  - job: AnalyzeResults
    displayName: 'Analyze Spot Test Results'
    pool:
      vmImage: 'ubuntu-latest'
    
    steps:
    - task: DownloadBuildArtifacts@0
      inputs:
        buildType: 'current'
        downloadType: 'all'
        downloadPath: '$(System.ArtifactsDirectory)'
    
    - script: |
        echo "## Spot Test Analysis" >> $(Build.ArtifactStagingDirectory)/summary.md
        echo "" >> $(Build.ArtifactStagingDirectory)/summary.md
        
        for artifact_dir in $(System.ArtifactsDirectory)/spot-test-*; do
          if [ -d "$artifact_dir" ]; then
            artifact_name=$(basename "$artifact_dir")
            result_file="$artifact_dir/spot-test-results.json"
            
            if [ -f "$result_file" ]; then
              parity=$(jq -r '.summary.parityScore // "N/A"' "$result_file")
              issues=$(jq -r '.summary.recommendDeepAnalysis // false' "$result_file")
              
              status="✅ Passed"
              if [ "$issues" = "true" ]; then
                status="⚠️ Issues"
              fi
              
              echo "- **$artifact_name**: $status (Parity: $parity%)" >> $(Build.ArtifactStagingDirectory)/summary.md
            fi
          fi
        done
      displayName: 'Generate summary'
    
    - task: PublishBuildArtifacts@1
      inputs:
        pathToPublish: '$(Build.ArtifactStagingDirectory)/summary.md'
        artifactName: 'spot-test-summary'
```

## CircleCI

### Configuration

```yaml
# .circleci/config.yml
version: 2.1

orbs:
  node: circleci/node@5.0.0

executors:
  node-executor:
    docker:
      - image: cimg/node:18.16
    working_directory: ~/project

commands:
  install-frotz:
    steps:
      - run:
          name: Install Z-Machine interpreter
          command: |
            sudo apt-get update
            sudo apt-get install -y frotz

  run-spot-test:
    parameters:
      mode:
        type: string
        default: "standard"
      threshold:
        type: integer
        default: 95
      commands:
        type: integer
        default: 50
    steps:
      - run:
          name: Run spot test (<<parameters.mode>>)
          command: |
            case "<<parameters.mode>>" in
              quick) npx tsx scripts/spot-test-parity.ts --quick --threshold <<parameters.threshold>> --output json ;;
              standard) npx tsx scripts/spot-test-parity.ts --ci --threshold <<parameters.threshold>> --output json ;;
              thorough) npx tsx scripts/spot-test-parity.ts --thorough --threshold <<parameters.threshold>> --output json ;;
              custom) npx tsx scripts/spot-test-parity.ts --commands <<parameters.commands>> --threshold <<parameters.threshold>> --output json ;;
            esac
          environment:
            SPOT_TEST_VERBOSE: true

jobs:
  spot-test-quick:
    executor: node-executor
    steps:
      - checkout
      - node/install-packages
      - install-frotz
      - run-spot-test:
          mode: "quick"
          threshold: 90
      - store_artifacts:
          path: spot-test-results.json
          destination: quick-results.json
      - store_test_results:
          path: spot-test-results.xml

  spot-test-standard:
    executor: node-executor
    steps:
      - checkout
      - node/install-packages
      - install-frotz
      - run-spot-test:
          mode: "standard"
          threshold: 95
      - store_artifacts:
          path: spot-test-results.json
          destination: standard-results.json
      - store_test_results:
          path: spot-test-results.xml

  spot-test-focused:
    executor: node-executor
    parallelism: 4
    steps:
      - checkout
      - node/install-packages
      - install-frotz
      - run:
          name: Run focused spot test
          command: |
            case $CIRCLE_NODE_INDEX in
              0) npx tsx scripts/spot-test-parity.ts --focus house --commands 50 --output json ;;
              1) npx tsx scripts/spot-test-parity.ts --focus forest --commands 50 --output json ;;
              2) npx tsx scripts/spot-test-parity.ts --focus underground --commands 50 --output json ;;
              3) npx tsx scripts/spot-test-parity.ts --focus puzzles --commands 50 --output json ;;
            esac
      - store_artifacts:
          path: spot-test-results.json
          destination: focused-results-${CIRCLE_NODE_INDEX}.json

  analyze-results:
    executor: node-executor
    steps:
      - checkout
      - attach_workspace:
          at: ~/project
      - run:
          name: Download and analyze results
          command: |
            # This would typically download artifacts from previous jobs
            # and perform analysis
            echo "Analyzing spot test results..."
            
            # Generate summary report
            echo "# Spot Test Summary" > summary.md
            echo "Build: $CIRCLE_BUILD_NUM" >> summary.md
            echo "Commit: $CIRCLE_SHA1" >> summary.md
      - store_artifacts:
          path: summary.md

workflows:
  spot-test-workflow:
    jobs:
      - spot-test-quick:
          filters:
            branches:
              ignore: main
      - spot-test-standard:
          filters:
            branches:
              only: main
      - spot-test-focused:
          filters:
            branches:
              only: develop
      - analyze-results:
          requires:
            - spot-test-quick
            - spot-test-standard
          filters:
            branches:
              only: [main, develop]
```

## Best Practices for CI/CD Integration

### 1. Threshold Management

```bash
# Development branches - more lenient
--threshold 90

# Main/master branches - stricter
--threshold 95

# Release branches - strictest
--threshold 98
```

### 2. Timeout Configuration

```bash
# Quick feedback for PRs
--timeout 15000

# Standard CI builds
--timeout 30000

# Comprehensive nightly builds
--timeout 60000
```

### 3. Artifact Management

Always save test results for analysis:

```yaml
# GitHub Actions
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: spot-test-results
    path: |
      spot-test-results.json
      spot-test-results.xml
    retention-days: 30
```

### 4. Notification Strategies

```yaml
# Notify on failures only
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    text: "Spot test failed with parity below threshold"

# Notify on issues detected
- name: Notify on issues
  if: steps.test-results.outputs.recommend-deep-analysis == 'true'
  uses: 8398a7/action-slack@v3
  with:
    status: warning
    text: "Spot test detected issues - consider comprehensive testing"
```

### 5. Conditional Execution

```yaml
# Run different tests based on file changes
- name: Detect changes
  uses: dorny/paths-filter@v2
  id: changes
  with:
    filters: |
      game-logic:
        - 'src/game/**'
        - 'src/engine/**'

- name: Run game logic tests
  if: steps.changes.outputs.game-logic == 'true'
  run: npx tsx scripts/spot-test-parity.ts --focus underground,puzzles
```

### 6. Performance Optimization

```yaml
# Cache dependencies
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

# Parallel execution
strategy:
  matrix:
    test-type: [quick, standard, focused]
  max-parallel: 3
```

### 7. Security Considerations

```yaml
# Use secrets for sensitive configuration
env:
  SPOT_TEST_API_KEY: ${{ secrets.SPOT_TEST_API_KEY }}

# Limit permissions
permissions:
  contents: read
  checks: write
  pull-requests: write
```

This comprehensive CI/CD integration guide provides examples for major platforms and best practices for implementing spot testing in automated workflows.