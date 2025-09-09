import os
import json
import asyncio
import traceback
from typing import Any, Dict, List, Optional
from fsspec.exceptions import FSTimeoutError
import aiohttp

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

# Google GenAI imports (per user's example)
from google import genai
from google.genai import types

# Argopy import (used to fetch Argo profiles)
# Make sure argopy is installed in the environment where this runs.
from argopy import DataFetcher as ArgoDataFetcher
import calendar
import datetime
import math
import math

app = FastAPI()

# --- Function declaration sent to Gemini ---
# Gemini will select a bounding box or specific points and return them
select_region_function = {
    "name": "select_region",
    "description": (
        "Always return a function call with selected latitude/longitude and optional date ranges "
        "for fetching Argo data in the Indian Ocean. "
        "Never respond with plain text. "
        "If the user mentions a date or range, include it as date_min/date_max (YYYY-MM). "
        "If no date is mentioned, leave them empty and the backend will default to last month. "
        "Choose either 'box' (bounding box) or 'points' (list of coordinates). "
        "Also select which variables are relevant to the user's request (temperature, salinity, pressure)."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "mode": {
                "type": "string",
                "enum": ["box", "points"],
                "description": "Return either a single bounding box (box) or a list of point coordinates (points).",
            },
            "variables": {
                "type": "array",
                "items": {
                    "type": "string",
                    "enum": ["temperature", "salinity", "pressure"],
                },
                "description": "Which ocean variables the user is asking for. Choose 1-2 max.",
            },
            "box": {
                "type": "object",
                "properties": {
                    "lon_min": {"type": "number"},
                    "lon_max": {"type": "number"},
                    "lat_min": {"type": "number"},
                    "lat_max": {"type": "number"},
                },
                "required": ["lon_min", "lon_max", "lat_min", "lat_max"],
            },
            "points": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "lat": {"type": "number"},
                        "lon": {"type": "number"},
                    },
                    "required": ["lat", "lon"],
                },
                "description": "List of (lat, lon) points to fetch individually.",
            },
            "date_min": {
                "type": "string",
                "description": "Start date in YYYY-MM format (optional).",
            },
            "date_max": {
                "type": "string",
                "description": "End date in YYYY-MM format (optional).",
            },
        },
        "required": ["mode"],
    },
}


# --- Helper: prepare Google client ---
def normalize_date_range(date_min: Optional[str], date_max: Optional[str]):
    """
    Convert YYYY-MM strings into full YYYY-MM-DD ISO strings.
    If None, fallback to last month.
    """
    if not date_min or not date_max:
        return get_default_date_range()

    try:
        # Parse YYYY-MM
        y_min, m_min = map(int, date_min.split("-"))
        y_max, m_max = map(int, date_max.split("-"))

        start_date = datetime.date(y_min, m_min, 1)
        last_day = calendar.monthrange(y_max, m_max)[1]
        end_date = datetime.date(y_max, m_max, last_day)

        return start_date.isoformat(), end_date.isoformat()
    except Exception:
        # fallback to default last month
        return get_default_date_range()


def get_default_date_range():
    today = datetime.date.today()
    first_of_this_month = today.replace(day=1)
    last_month_end = first_of_this_month - datetime.timedelta(days=1)
    last_month_start = last_month_end.replace(day=1)
    return last_month_start.isoformat(), last_month_end.isoformat()


def create_genai_client() -> genai.Client:
    api_key = "AIzaSyD-7cXQPrKkYIJIsnnlTjXeo2drONhmIU0"
    if not api_key:
        raise RuntimeError("Environment variable GOOGLE_API_KEY is required")
    client = genai.Client(api_key=api_key)
    # Note: some genai SDKs accept api_key as Client(api_key=...), adapt if needed.
    return client

# --- Helper: generate dynamic analysis using Gemini ---
def generate_data_analysis(query: str, data_result: Dict[str, Any], query_meta: Dict[str, Any]) -> str:
    """Generate a dynamic analysis of the ocean data based on the user's query and results."""
    client = create_genai_client()
    
    # Prepare data summary for Gemini
    data_summary = ""
    if data_result.get("summary"):
        summary_data = data_result["summary"]
        if isinstance(summary_data, list) and len(summary_data) > 0:
            data_summary = f"Found {len(summary_data)} data points with columns: {list(summary_data[0].keys()) if summary_data[0] else 'none'}"
        else:
            data_summary = f"Found data with summary: {str(summary_data)[:200]}..."
    elif data_result.get("summaries"):
        summaries = data_result["summaries"]
        successful = [s for s in summaries if not s.get("error")]
        data_summary = f"Found data from {len(successful)} out of {len(summaries)} requested locations"
    
    # Create analysis prompt
    analysis_prompt = f"""
You are an ocean data analyst. A user asked: "{query}"

Query details:
- Mode: {query_meta.get('mode', 'unknown')}
- Time period: {query_meta.get('date_start', 'N/A')} to {query_meta.get('date_end', 'N/A')}
- Variables requested: {query_meta.get('selected_variables', [])}

Data results:
{data_summary}

RESPONSE STYLE GUIDELINES:

**IMPORTANT**: Always use rich Markdown formatting to make your response visually appealing and easy to read. Use **bold text**, bullet points, headers, and separators.

1. **RESEARCH/ANALYSIS QUERIES** (when user asks "why", "how", "what does this mean", "explain", "analyze", "research", "study", "significance"):
   - Use **## Key Findings** headers
   - Include **bold** key terms and important values
   - Use bullet points for multiple findings: • **Finding**: explanation
   - Add horizontal separators (---) between sections
   - Provide 2-3 well-formatted paragraphs with context
   - Include background information about ocean processes
   - Explain the significance of the findings
   - Mention implications for climate/marine research

2. **DATA REQUESTS** (when user asks "show me", "give me", "what is the", "temperature", "salinity", specific values):
   - Use **bold** for key values and measurements
   - Format as: **Temperature**: 25.2°C - 28.7°C
   - Use bullet points for multiple data points
   - Add **## Data Summary** header
   - Keep it concise but visually formatted

3. **GENERAL QUERIES** (mixed or unclear intent):
   - Use **## Overview** header
   - Include **bold** key findings
   - Use bullet points for multiple points
   - 1-2 well-formatted paragraphs with context

**FORMATTING REQUIREMENTS**:
- Always use **bold** for important values, measurements, and key terms
- Use bullet points (•) for lists and multiple findings
- Use ## headers for main sections
- Use --- for visual separators between sections
- Make the text visually appealing and scannable

Choose the appropriate style based on the user's query, but ALWAYS include rich Markdown formatting.
"""
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=analysis_prompt,
        )
        return response.text
    except Exception as e:
        # Fallback to basic analysis if Gemini fails
        return f"## Data Summary\n\n• **Data Found**: Oceanographic measurements in your requested region\n• **Source**: **Argo autonomous floats**\n• **Use**: Climate research and marine studies\n\n---\n\nThis data provides valuable insights into ocean conditions for scientific research."


# --- Helper: call Gemini with function declarations ---
def gemini_select_region(query: str) -> Dict[str, Any]:
    """Send the query to Gemini and return the function_call if present.

    Returns a dict with keys:
      - function_call: {name, args}   OR
      - text: string (if no function call)
    """
    client = create_genai_client()

    tools = types.Tool(function_declarations=[select_region_function])
    config = types.GenerateContentConfig(tools=[tools])

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=query,
        config=config,
    )

    candidate = response.candidates[0]
    part0 = candidate.content.parts[0]

    if part0.function_call:
        return {
            "function_call": {
                "name": part0.function_call.name,
                "args": json.loads(part0.function_call.args)
                if isinstance(part0.function_call.args, str)
                else part0.function_call.args,
            }
        }
    else:
        # fallback: return plain text
        return {"text": response.text}


# --- Helper: fetch data from Argopy for a bounding box or points ---
def fetch_argopy_for_box(
    box: Dict[str, float],
    date_min: Optional[str] = None,
    date_max: Optional[str] = None,
) -> Dict[str, Any]:
    date_min, date_max = normalize_date_range(date_min, date_max)

    region = [
        box["lon_min"],
        box["lon_max"],
        box["lat_min"],
        box["lat_max"],
        0,
        2000,
        date_min,
        date_max,
    ]

    argo = ArgoDataFetcher()
    ds = argo.region(region).to_dataframe()
    # Convert to JSON-serializable structure (limit sample size) and sanitize
    try:
        total_count = len(ds)
    except Exception:
        total_count = None

    def sanitize(value: Any) -> Any:
        if value is None:
            return None
        if isinstance(value, float):
            return value if math.isfinite(value) else None
        if isinstance(value, (int, str, bool)):
            return value
        if isinstance(value, (datetime.date, datetime.datetime)):
            try:
                return value.isoformat()
            except Exception:
                return str(value)
        if isinstance(value, dict):
            return {k: sanitize(v) for k, v in value.items()}
        if isinstance(value, (list, tuple)):
            return [sanitize(v) for v in value]
        try:
            if hasattr(value, "item"):
                return sanitize(value.item())
        except Exception:
            pass
        return str(value)

    try:
        raw_records = ds.head(50).to_dict(orient="records")
        sample_records = sanitize(raw_records)
    except Exception:
        # Fallback: stringify if conversion fails
        sample_records = [str(ds)]
    return {"summary": sample_records, "total": total_count}


def fetch_argopy_for_points(
    points: List[Dict[str, float]],
    date_min: Optional[str] = None,
    date_max: Optional[str] = None,
) -> Dict[str, Any]:
    combined = {"summaries": []}
    for p in points:
        box = {
            "lon_min": p["lon"] - 0.1,
            "lon_max": p["lon"] + 0.1,
            "lat_min": p["lat"] - 0.1,
            "lat_max": p["lat"] + 0.1,
        }
        try:
            res = fetch_argopy_for_box(box, date_min, date_max)
            combined["summaries"].append(
                {"point": p, "summary": res.get("summary"), "total": res.get("total")}
            )
        except Exception as exc:
            combined["summaries"].append({"point": p, "error": str(exc)})
    return combined


# --- WebSocket endpoint ---
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            data = await ws.receive_text()
            print(f"Received data: {data}")
            try:
                payload = json.loads(data)
            except json.JSONDecodeError:
                await ws.send_text(
                    json.dumps({"error": 'Invalid JSON. Send {"query": "..."}'})
                )
                continue

            query = payload.get("query")
            if not query:
                await ws.send_text(json.dumps({"error": "Missing 'query' in payload."}))
                continue

            # Stage 1: Analyzing
            await ws.send_text(
                json.dumps({
                    "stage": "analyzing", 
                    "message": "🔎 Analyzing your query",
                    "thinking": [
                        "Understanding the ocean data request",
                        "Identifying geographical parameters",
                        "Determining time range requirements",
                        "Selecting relevant ocean variables",
                        "Validating query parameters",
                        "Preparing for AI processing"
                    ]
                })
            )

            loop = asyncio.get_running_loop()
            try:
                gemini_result = await loop.run_in_executor(
                    None, gemini_select_region, query
                )
            except Exception as exc:
                await ws.send_text(
                    json.dumps(
                        {"stage": "error", "message": f"Gemini call failed: {exc}"}
                    )
                )
                continue

            if "function_call" in gemini_result:
                fc = gemini_result["function_call"]

                # Stage 2: Generating SQL
                print(f"Generating SQL for function call: {fc}")
                await ws.send_text(
                    json.dumps(
                        {
                            "stage": "sql_generation",
                            "message": "🛠 Generating SQL for your request",
                            "thinking": [
                                "Parsing natural language to structured query",
                                "Extracting geographical coordinates",
                                "Building database query parameters",
                                "Validating query constraints",
                                "Optimizing query performance",
                                "Preparing data retrieval strategy"
                            ]
                        }
                    )
                )

                args = fc.get("args", {})
                if fc["name"] == "select_region":
                    mode = args.get("mode")
                    date_min = args.get("date_min")
                    date_max = args.get("date_max")
                    variables = args.get("variables", [])

                    # Build query meta (normalized date range) to send back to frontend
                    nm_start, nm_end = normalize_date_range(date_min, date_max)
                    query_meta = {
                        "mode": mode,
                        "date_min_provided": date_min,
                        "date_max_provided": date_max,
                        "date_start": nm_start,
                        "date_end": nm_end,
                        "selected_variables": variables,
                    }

                    try:
                        # Stage 3: Fetching from DB
                        print(
                            f"Fetching data for mode: {mode}, date_min: {date_min}, date_max: {date_max}, args: {args}"
                        )
                        await ws.send_text(
                            json.dumps(
                                {
                                    "stage": "db_fetch",
                                    "message": "📡 Fetching data from PostgreSQL",
                                    "thinking": [
                                        "Connecting to Argo global database",
                                        "Querying ocean float measurements",
                                        "Filtering by geographical region",
                                        "Applying time range constraints",
                                        "Retrieving temperature, salinity, and pressure data",
                                        "Validating data quality and completeness",
                                        "Organizing results by location and time"
                                    ]
                                }
                            )
                        )

                        if mode == "box":
                            box = args.get("box")
                            if not box:
                                raise ValueError(
                                    "Gemini returned mode 'box' but no box provided"
                                )
                            
                            # Try the original box first
                            try:
                                raw_result = await loop.run_in_executor(
                                    None, fetch_argopy_for_box, box, date_min, date_max
                                )
                                query_meta["box"] = box
                            except (FileNotFoundError, FSTimeoutError, asyncio.TimeoutError, aiohttp.ClientError):
                                # If original box fails, try with a broader area
                                print(f"Original box failed, trying broader area...")
                                broader_box = {
                                    "lon_min": max(-180, box["lon_min"] - 2.0),
                                    "lon_max": min(180, box["lon_max"] + 2.0),
                                    "lat_min": max(-90, box["lat_min"] - 2.0),
                                    "lat_max": min(90, box["lat_max"] + 2.0),
                                }
                                try:
                                    raw_result = await loop.run_in_executor(
                                        None, fetch_argopy_for_box, broader_box, date_min, date_max
                                    )
                                    query_meta["box"] = broader_box
                                    query_meta["expanded_search"] = True
                                    print(f"Successfully found data with broader search area")
                                except Exception:
                                    # Re-raise the original exception if broader search also fails
                                    raise

                        elif mode == "points":
                            points = args.get("points", [])
                            if not points:
                                raise ValueError(
                                    "Gemini returned mode 'points' but no points provided"
                                )
                            raw_result = await loop.run_in_executor(
                                None,
                                fetch_argopy_for_points,
                                points,
                                date_min,
                                date_max,
                            )
                            query_meta["points"] = points

                        else:
                            await ws.send_text(
                                json.dumps(
                                    {
                                        "stage": "error",
                                        "message": f"Unknown mode from Gemini: {mode}",
                                    }
                                )
                            )
                            continue

                        # Stage 4: Processing data
                        print(
                            f"Fetching data for mode: {mode}, date_min: {date_min}, date_max: {date_max}, args: {args}"
                        )
                        await ws.send_text(
                            json.dumps(
                                {
                                    "stage": "processing", 
                                    "message": "⚙️ Processing data",
                                    "thinking": [
                                        "Cleaning and validating ocean measurements",
                                        "Filtering data by requested variables",
                                        "Organizing results by location and time",
                                        "Preparing data for visualization",
                                        "Generating summary statistics",
                                        "Creating data quality reports",
                                        "Finalizing analysis results"
                                    ]
                                }
                            )
                        )
                        # result = process_data(raw_result)  # wrap your pandas/cleaning logic here
                        result = raw_result

                        # Optional filtering to requested variables, keep full data for toggle
                        def pick_columns(records, variables_list):
                            if not isinstance(records, list) or not records:
                                return records
                            present_keys = set(records[0].keys())

                            def find_key(candidates):
                                for c in candidates:
                                    if c in present_keys:
                                        return c
                                    up = c.upper()
                                    if up in present_keys:
                                        return up
                                    ti = c.title()
                                    if ti in present_keys:
                                        return ti
                                return None

                            essential_candidates = [
                                ["LATITUDE", "latitude", "Lat"],
                                ["LONGITUDE", "longitude", "Lon"],
                                ["TIME", "time", "Date", "date"],
                            ]
                            essential = [
                                fk
                                for group in essential_candidates
                                for fk in ([find_key(group)] if find_key(group) else [])
                            ]
                            var_map = {
                                "temperature": ["TEMP", "temperature", "temp"],
                                "salinity": ["PSAL", "salinity", "sal"],
                                "pressure": ["PRES", "pressure", "pres"],
                            }
                            selected_keys = []
                            for v in variables_list or []:
                                found = find_key(var_map.get(v, []))
                                if found and found not in selected_keys:
                                    selected_keys.append(found)
                            if not selected_keys:
                                return records
                            keep = set(selected_keys + essential)
                            return [
                                {k: row.get(k) for k in keep if k in row}
                                for row in records
                            ]

                        if variables:
                            if isinstance(result, dict) and isinstance(
                                result.get("summary"), list
                            ):
                                full_summary = result["summary"]
                                filtered_summary = pick_columns(full_summary, variables)
                                result = {
                                    **result,
                                    "full_summary": full_summary,
                                    "summary": filtered_summary,
                                }
                            elif isinstance(result, dict) and isinstance(
                                result.get("summaries"), list
                            ):
                                new_summaries = []
                                for item in result["summaries"]:
                                    if isinstance(item, dict) and isinstance(
                                        item.get("summary"), list
                                    ):
                                        fs = item["summary"]
                                        new_summaries.append(
                                            {
                                                **item,
                                                "full_summary": fs,
                                                "summary": pick_columns(fs, variables),
                                            }
                                        )
                                    else:
                                        new_summaries.append(item)
                                result = {**result, "summaries": new_summaries}

                        # Stage 5: Generate dynamic analysis
                        await ws.send_text(
                            json.dumps(
                                {
                                    "stage": "completed", 
                                    "message": "✅ Generating analysis",
                                    "thinking": [
                                        "Finalizing data processing",
                                        "Preparing response format",
                                        "Generating user-friendly summary",
                                        "Ready to display results"
                                    ]
                                }
                            )
                        )
                        
                        # Add a small delay to let the thinking animation complete
                        await asyncio.sleep(2)
                        
                        # Generate dynamic analysis using Gemini
                        try:
                            dynamic_analysis = await loop.run_in_executor(
                                None, generate_data_analysis, query, result, query_meta
                            )
                            result["dynamic_analysis"] = dynamic_analysis
                        except Exception as e:
                            print(f"Failed to generate dynamic analysis: {e}")
                            result["dynamic_analysis"] = "Analysis generation failed, showing data results."
                        
                        await ws.send_text(
                            json.dumps(
                                {
                                    "stage": "result",
                                    "result": result,
                                    "query_meta": query_meta,
                                },
                                default=str,
                                allow_nan=False,
                            )
                        )
                        print(f"Sent result: {result}")

                    except (
                        FSTimeoutError,
                        asyncio.TimeoutError,
                        aiohttp.ClientError,
                        FileNotFoundError,
                    ) as exc:
                        # Soft-fail on network/data errors: return a friendly result instead of an error stage
                        error_type = "timeout" if isinstance(exc, (FSTimeoutError, asyncio.TimeoutError)) else "no_data"
                        
                        if error_type == "no_data":
                            friendly_message = (
                                "## No Data Found\n\n"
                                "No ocean data was found for your requested region and time period.\n\n"
                                "**Possible reasons:**\n"
                                "• Limited **Argo float** coverage in this region\n"
                                "• No measurements available in the specified time period\n"
                                "• Area is outside the main **Argo network**\n\n"
                                "**Solution:** Try expanding your search area or using a different time period."
                            )
                        else:
                            friendly_message = (
                                "## Timeout Error\n\n"
                                "The **ocean data source** timed out while fetching results.\n\n"
                                "**Solution:** Try a smaller date range or a narrower region, then try again."
                            )
                        
                        await ws.send_text(
                            json.dumps(
                                {
                                    "stage": "result",
                                    "result": friendly_message,
                                    "query_meta": query_meta,
                                },
                                allow_nan=False,
                            )
                        )
                    except Exception as exc:
                        tb = traceback.format_exc()
                        await ws.send_text(
                            json.dumps(
                                {
                                    "stage": "error",
                                    "message": f"Error during fetch/processing: {str(exc)}",
                                    "traceback": tb,
                                }
                            )
                        )
                else:
                    await ws.send_text(
                        json.dumps(
                            {
                                "stage": "error",
                                "message": "Unknown function requested by Gemini.",
                            }
                        )
                    )
            else:
                text = gemini_result.get("text", "")
                await ws.send_text(
                    json.dumps({"stage": "no_function_call", "message": text})
                )

    except WebSocketDisconnect:
        print("Client disconnected")


# --- Simple index for manual testing ---
@app.get("/")
def index():
    return HTMLResponse(
        """
        <html>
            <head>
                <title>Gemini + Argopy WebSocket Test</title>
            </head>
            <body>
                <h3>WebSocket server is running.</h3>
                <p>Use a WebSocket client to connect to <code>ws://localhost:8000/ws</code></p>
            </body>
        </html>
        """
    )

