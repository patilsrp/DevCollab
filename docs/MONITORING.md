# Monitoring & Metrics

DevCollab exposes Prometheus-compatible metrics at `GET /metrics`.

## Quick Start

Start the monitoring stack alongside the app:

```bash
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up
```

- **Prometheus:** `http://localhost:9090`
- **Grafana:** `http://localhost:3000` (default user: `admin`, password from `GRAFANA_PASSWORD`)
- **Server metrics:** `http://localhost:3001/metrics`

## Available Metrics

### Process / Runtime (default `prom-client` metrics)
Prefixed with `devcollab_`: CPU, memory (heap/RSS), event loop lag, GC, file descriptors, Node.js version info.

### HTTP
| Metric | Type | Labels |
| --- | --- | --- |
| `devcollab_http_requests_total` | Counter | `method`, `route`, `status_code` |
| `devcollab_http_request_duration_seconds` | Histogram | `method`, `route`, `status_code` |

### Socket.IO
| Metric | Type | Labels |
| --- | --- | --- |
| `devcollab_socket_connections_total` | Counter | — |
| `devcollab_socket_disconnections_total` | Counter | `reason` |
| `devcollab_socket_events_total` | Counter | `event`, `status` |
| `devcollab_socket_active_connections` | Gauge | — |

### Rooms
| Metric | Type | Labels |
| --- | --- | --- |
| `devcollab_active_rooms` | Gauge | — |
| `devcollab_users_per_room` | Histogram | — |
| `devcollab_room_operations_total` | Counter | `operation` (join, leave, create) |

### Security / Quality
| Metric | Type | Labels |
| --- | --- | --- |
| `devcollab_rate_limit_hits_total` | Counter | `event` |
| `devcollab_validation_failures_total` | Counter | `event` |

### Redis
| Metric | Type | Labels |
| --- | --- | --- |
| `devcollab_redis_operation_duration_seconds` | Histogram | `operation`, `status` |

## Useful PromQL Queries

**Request rate (per second, last 5min) per route:**
```promql
sum by (route) (rate(devcollab_http_requests_total[5m]))
```

**P95 request latency:**
```promql
histogram_quantile(0.95, sum by (le, route) (rate(devcollab_http_request_duration_seconds_bucket[5m])))
```

**Active rooms vs. active connections:**
```promql
devcollab_active_rooms
devcollab_socket_active_connections
```

**Top events by rate:**
```promql
topk(5, sum by (event) (rate(devcollab_socket_events_total[5m])))
```

**Rate limit hit rate (potential abuse):**
```promql
sum by (event) (rate(devcollab_rate_limit_hits_total[5m]))
```

## Alerting Ideas

- **High error rate:** `sum(rate(devcollab_http_requests_total{status_code=~"5.."}[5m])) > 0.5`
- **No connections accepted:** `rate(devcollab_socket_connections_total[5m]) == 0` for 10m+
- **Event loop lag spikes:** `devcollab_nodejs_eventloop_lag_seconds > 0.1`
- **Heap growth:** sudden increases in `devcollab_nodejs_heap_size_used_bytes`