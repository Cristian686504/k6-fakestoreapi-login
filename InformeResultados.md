# Informe de Resultados de Prueba de Carga: App Transaction Balance

---

## 1. Resumen Ejecutivo

Se realizó una prueba de carga sobre el endpoint de consulta de saldos (App Transaction Balance) para evaluar la estabilidad y el rendimiento del sistema bajo una carga constante de **140 usuarios virtuales (VUs)**. Los resultados muestran que, si bien el sistema procesó la mayoría de las peticiones, presentó periodos críticos de inestabilidad y una tasa de error que requiere atención.

---

## 2. Métricas Clave de Rendimiento

A continuación se detallan los indicadores principales obtenidos durante la ejecución:

| Métrica | Valor | Notas |
|---|---|---|
| **Peticiones Totales** | 276,650 | - |
| **Throughput (RPS)** | 73.17 req/s | Promedio durante la prueba. |
| **Tasa de Éxito (Checks)** | 97.55% | 2.44% de fallos detectados. |
| **Tiempo de Respuesta (Avg)** | 861.68 ms | Tiempo medio de respuesta. |
| **Tiempo de Respuesta (P95)** | 1.57 s | El 95% de las peticiones fue inferior a este valor. |
| **Tiempo Máximo** | 29.93 s | Se detectaron picos extremos de latencia. |
| **Usuarios Virtuales (VUs)** | 140 | Carga máxima alcanzada. |

---

## 3. Análisis del Comportamiento (VUs vs. RPS)

Al analizar el diagrama de monitoreo de VUs vs. http_reqs, se observan los siguientes hallazgos:

- **Inestabilidad en el Procesamiento:** Aunque el número de usuarios (VUs) se mantuvo constante en 140, el número de peticiones por segundo fue altamente irregular.

- **Caída Crítica de Rendimiento:** Entre las 01:50:00 y las 02:00:00, se observa un descenso drástico en el rendimiento donde las peticiones cayeron casi a cero, a pesar de que la carga de usuarios seguía activa. Esto sugiere un bloqueo en el servidor, agotamiento de recursos (CPU/RAM) o tiempos de espera (timeouts) masivos.

- **Recuperación Parcial:** El sistema logró recuperarse después de las 02:00:00, pero mantuvo la misma volatilidad en el throughput hasta el final de la prueba.

---

## 4. Análisis de Errores

La prueba registró un total de **6,759 peticiones fallidas (2.44%)**. El desglose de errores es el siguiente:

- **Errores HTTP 5xx (5,987 casos):** La gran mayoría de los fallos son errores de servidor. Esto indica que la infraestructura o la aplicación no pudo procesar la solicitud debido a excepciones internas o saturación.

- **Errores HTTP 4xx (769 casos):** Una cantidad menor de errores relacionados con el cliente o peticiones mal formadas/no autorizadas durante el pico de estrés.

---

## 5. Conclusiones

- **Punto de Quiebre Detectado:** El sistema no soporta de manera estable una carga sostenida de 140 VUs. La caída drástica en la gráfica de peticiones indica una degradación severa del servicio.

- **Latencia Inconsistente:** Existe una diferencia abismal entre el tiempo promedio (861ms) y el tiempo máximo (29.9s). Estas variaciones impactan directamente en la experiencia del usuario.

- **Fiabilidad Comprometida:** Una tasa de error del 2.44% con predominancia de errores 5xx es inaceptable para un entorno de producción de transacciones financieras.

---

## 6. Recomendaciones

- **Revisión de Logs del Servidor:** Investigar la causa raíz de los errores 5xx durante el periodo de 01:50 a 02:00.

- **Optimización de Base de Datos:** Verificar si existen bloqueos (deadlocks) o consultas lentas que coincidan con la caída del rendimiento.

- **Ajuste de Timeouts:** Revisar la configuración de los tiempos de espera en el balanceador de carga o servidor de aplicaciones, dado el valor máximo de 29.9s reportado.

- **Prueba de Stress Escalonada:** Realizar una nueva prueba aumentando los usuarios gradualmente (Ramp-up) para identificar exactamente en qué número de VUs el sistema empieza a degradarse.
