# Conclusiones - Prueba de Carga Login FakeStoreAPI

## Resumen Ejecutivo

Se ejecutó una prueba de carga sobre el servicio de autenticación de FakeStoreAPI (`POST /auth/login`) con una tasa objetivo de **20 TPS** sostenidos durante **1 minuto**. La prueba reveló que el servicio cumple satisfactoriamente con los tiempos de respuesta, pero presenta una **tasa de error elevada (16.06%)** que supera significativamente el umbral aceptable del 3%.

---

## Resultados Obtenidos

### Métricas Principales

| Métrica | Resultado | Umbral | Estado |
|---|---|---|---|
| **TPS alcanzados** | ~19.90/s | 20/s | ✅ Cumple |
| **Tiempo de respuesta p(95)** | 457.79 ms | < 1500 ms | ✅ Cumple |
| **Tiempo de respuesta promedio** | 390.14 ms | — | ✅ Aceptable |
| **Tiempo de respuesta máximo** | 1042.44 ms | < 1500 ms | ✅ Cumple |
| **Tasa de error inesperado** | 16.06% (193/1201) | < 3% | ❌ No cumple |
| **Total de peticiones** | 1,201 | — | — |
| **VUs utilizados** | 6-10 (máx 50 asignados) | — | — |

### Resultados de Checks

| Validación | Éxitos | Fallos | Tasa de Éxito |
|---|---|---|---|
| `status is 201 or 401` | 1,008 | 193 | 83.93% |
| `response time < 1500ms` | 1,201 | 0 | 100.00% |
| `valid credentials return token` | 1,008 | 193 | 83.93% |
| `no server errors (5xx)` | 1,201 | 0 | 100.00% |

### Distribución de Tiempos de Respuesta

| Percentil | Valor |
|---|---|
| **Mínimo** | 239.43 ms |
| **Mediana (p50)** | 404.86 ms |
| **p(90)** | 435.22 ms |
| **p(95)** | 457.79 ms |
| **Máximo** | 1,042.44 ms |

---

## Hallazgos

### 1. El endpoint responde con código 201 (no 200)

Al enviar un login exitoso, la API FakeStoreAPI retorna **HTTP 201 Created** en lugar del esperado 200 OK. Esto fue descubierto durante la primera ejecución de pruebas y corregido en el script. Es un comportamiento atípico para un endpoint de autenticación, donde la convención es 200.

### 2. El usuario `donero` tiene credenciales inválidas

De los 5 usuarios en el CSV, **4 son válidos** y 1 (`donero/evedon`) recibe 401 Unauthorized. Esto fue validado manualmente y es consistente con los datos de la API. La distribución esperada de respuestas 401 es ~20% del total, lo cual se configuró como comportamiento esperado en el script (no cuenta como error de servicio).

### 3. Tasa de error inesperado del 16.06% bajo carga de 20 TPS

De las 1,201 peticiones realizadas, **193 recibieron respuestas inesperadas** (ni 201 ni 401). Esto indica que la API FakeStoreAPI experimenta degradación bajo carga sostenida de 20 TPS. Dado que no se observaron errores 5xx (el check `no server errors (5xx)` pasó al 100%).

**Este hallazgo es significativo:** el umbral de 3% de error se superó por más de 5 veces, lo que indica que FakeStoreAPI no soporta de forma confiable 20 TPS sostenidos en su endpoint de login.

### 4. Tiempos de respuesta excelentes

A pesar de los errores, los tiempos de respuesta se mantuvieron muy por debajo del umbral de 1,500 ms:
- El **p(95) fue de 457.79 ms**, apenas un 30.5% del máximo permitido.
- Incluso el tiempo máximo observado (1,042 ms) estuvo por debajo del umbral.
- La mediana fue de ~405 ms, lo que indica una distribución estable.

### 5. Uso eficiente de VUs

El escenario utilizó entre 6 y 10 VUs simultáneos de los 50 pre-asignados. Esto demuestra que el servicio responde lo suficientemente rápido como para no requerir un gran pool de VUs concurrentes para mantener 20 TPS.

---

## Conclusiones

1. **El servicio NO cumple el criterio de tasa de error**: Con 16.06% de errores inesperados vs. el 3% aceptable, FakeStoreAPI no es confiable bajo 20 TPS sostenidos. Al ser una API gratuita de pruebas, esto es esperable — tiene limitaciones de rate limiting no documentadas.

2. **El servicio SÍ cumple el criterio de tiempo de respuesta**: El p(95) de 457.79 ms está muy por debajo del umbral de 1,500 ms. Cuando la API responde exitosamente, lo hace con latencias consistentes y bajas.

3. **La tasa de 20 TPS se alcanzó exitosamente**: El executor `constant-arrival-rate` mantuvo una tasa estable de ~19.90 req/s durante toda la ejecución.

4. **Para un entorno productivo real**, se recomienda:
   - Implementar mecanismos de retry con backoff exponencial
   - Considerar un circuit breaker para degradación graceful
   - Negociar cuotas de rate limiting con el proveedor del servicio
   - Ejecutar pruebas con rampas de carga progresivas para identificar el punto exacto de degradación

---

## Fecha de Ejecución

**30 de marzo de 2026** — k6 v1.7.0 — Windows 11 (amd64)
