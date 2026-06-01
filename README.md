# redeem

ChatGPT Plus 卡密充值页，前端使用 Vite + Vue，后端使用 Python 标准库做静态文件服务和接口路由转发。

## 启停

```bash
./start.sh
./stop.sh
./restart.sh
```

启动脚本会构建前端并在后台启动 Python 服务，默认访问地址：

```text
http://127.0.0.1:8090
```

## 后端接口

- `POST /api/check`：卡密校验，转发到上游 `/api/check`
- `POST /api/activate`：提交充值，转发到上游 `/api/activate`
- `POST /api/status`：状态查询，转发到上游 `/api/check`
- `GET /api/status?cdkey=...`：状态查询便捷入口
- `GET /api/stock`：库存查询，转发到上游 `/api/turkey_stock_count`

可通过环境变量覆盖上游和端口：

```bash
UPSTREAM_BASE_URL=https://gpt.86gamestore.com/api PORT=8090 ./start.sh
```
