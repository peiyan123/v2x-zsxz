# 标注



## QuickStart

<!-- add docs here for user -->

see [egg docs][egg] for more detail.

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:8001/
```

### Deploy

```bash
$ npm start
$ npm stop
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.


[egg]: https://eggjs.org

### Docker build
(可选) 删除镜像
docker rm -f edge-v2x-mark-server:0.0.1

构建镜像
docker build -t edge-v2x-mark-server:0.0.1 ./

使用edge-v2x-mark-server镜像运行

# 创建一个network
docker network create v2x-mark
# -d 后台运行
docker run -d -it \
           --name "edge-v2x-mark-server" \
           --network host \
           --restart=always \
           -v /opt/soft/v2x/:/opt/soft/v2x \
           -v /opt/soft/v2x/cameraImage:/app/app/public/cameraImage \
           -v /opt/soft/v2x/uploads:/app/app/public/uploads \
           edge-v2x-mark-server:0.0.1