module.exports = {
    apps: [
        {
            name: 'plan.service',
            script: './output/bin/index.js',
            // node_args: '-r dotenv/config',
            // <processes> can be 'max', -1 (all cpu minus 1) or a specified number of instances to start.
            instances: '2', // 클러스터 모드 사용 시 생성할 인스턴스 수
            exec_mode: 'cluster', // fork, cluster 모드 중 선택
            merge_logs: true, // 클러스터 모드 사용 시 각 클러스터에서 생성되는 로그를 한 파일로 합쳐준다.
            autorestart: true, // 프로세스 실패 시 자동으로 재시작할지 선택
            watch: false,
            ignore_watch: ['.git/*', 'log/*', 'node_modules/*'],
            env: {
                // 한수원
                REGION: 'khnp'
            },
            env_kospo: {
                // 남부
                REGION: 'kospo'
            }
        }
    ]
}
