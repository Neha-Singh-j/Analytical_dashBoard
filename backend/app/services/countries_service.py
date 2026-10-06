import requests
import json
import pandas as pd
from ..database.connection import get_db_connection

REST_COUNTRIES_URL = "https://restcountries.com/v3.1/all"

FALLBACK_COUNTRIES_SAMPLE = [
    {
        "cca2": "US", "cca3": "USA", "name": {"common": "United States", "official": "United States of America"},
        "region": "Americas", "subregion": "North America", "capital": ["Washington, D.C."], "population": 331449281,
        "area": 9372610, "currencies": {"USD": {"name": "United States dollar", "symbol": "$"}},
        "languages": {"eng": "English"}, "flag": "🇺🇸", "flags": {"png": "https://flagcdn.com/w320/us.png"}
    },
    {
        "cca2": "IN", "cca3": "IND", "name": {"common": "India", "official": "Republic of India"},
        "region": "Asia", "subregion": "Southern Asia", "capital": ["New Delhi"], "population": 1380004385,
        "area": 3287590, "currencies": {"INR": {"name": "Indian rupee", "symbol": "₹"}},
        "languages": {"hin": "Hindi", "eng": "English"}, "flag": "🇮🇳", "flags": {"png": "https://flagcdn.com/w320/in.png"}
    },
    {
        "cca2": "GB", "cca3": "GBR", "name": {"common": "United Kingdom", "official": "United Kingdom of Great Britain and Northern Ireland"},
        "region": "Europe", "subregion": "Northern Europe", "capital": ["London"], "population": 67215293,
        "area": 242900, "currencies": {"GBP": {"name": "British pound", "symbol": "£"}},
        "languages": {"eng": "English"}, "flag": "🇬🇧", "flags": {"png": "https://flagcdn.com/w320/gb.png"}
    },
    {
        "cca2": "CA", "cca3": "CAN", "name": {"common": "Canada", "official": "Canada"},
        "region": "Americas", "subregion": "North America", "capital": ["Ottawa"], "population": 38005238,
        "area": 9984670, "currencies": {"CAD": {"name": "Canadian dollar", "symbol": "$"}},
        "languages": {"eng": "English", "fra": "French"}, "flag": "🇨🇦", "flags": {"png": "https://flagcdn.com/w320/ca.png"}
    },
    {
        "cca2": "DE", "cca3": "DEU", "name": {"common": "Germany", "official": "Federal Republic of Germany"},
        "region": "Europe", "subregion": "Western Europe", "capital": ["Berlin"], "population": 83240525,
        "area": 357114, "currencies": {"EUR": {"name": "Euro", "symbol": "€"}},
        "languages": {"deu": "German"}, "flag": "🇩🇪", "flags": {"png": "https://flagcdn.com/w320/de.png"}
    },
    {
        "cca2": "JP", "cca3": "JPN", "name": {"common": "Japan", "official": "Japan"},
        "region": "Asia", "subregion": "Eastern Asia", "capital": ["Tokyo"], "population": 125836021,
        "area": 377930, "currencies": {"JPY": {"name": "Japanese yen", "symbol": "¥"}},
        "languages": {"jpn": "Japanese"}, "flag": "🇯🇵", "flags": {"png": "https://flagcdn.com/w320/jp.png"}
    },
    {
        "cca2": "AU", "cca3": "AUS", "name": {"common": "Australia", "official": "Commonwealth of Australia"},
        "region": "Oceania", "subregion": "Australia and New Zealand", "capital": ["Canberra"], "population": 25687041,
        "area": 7692024, "currencies": {"AUD": {"name": "Australian dollar", "symbol": "$"}},
        "languages": {"eng": "English"}, "flag": "🇦🇺", "flags": {"png": "https://flagcdn.com/w320/au.png"}
    },
    {
        "cca2": "BR", "cca3": "BRA", "name": {"common": "Brazil", "official": "Federative Republic of Brazil"},
        "region": "Americas", "subregion": "South America", "capital": ["Brasília"], "population": 212559417,
        "area": 8515767, "currencies": {"BRL": {"name": "Brazilian real", "symbol": "R$"}},
        "languages": {"por": "Portuguese"}, "flag": "🇧🇷", "flags": {"png": "https://flagcdn.com/w320/br.png"}
    }
]

def fetch_raw_countries_api():
    try:
        response = requests.get(REST_COUNTRIES_URL, timeout=3.0)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                return data
    except Exception as e:
        print(f"RestCountries live API error (using fallback matrix): {e}")
    return FALLBACK_COUNTRIES_SAMPLE

def normalize_country_item(item):
    if not isinstance(item, dict):
        return None

    cca2 = str(item.get("cca2") or item.get("alpha2Code") or "").strip()
    cca3 = str(item.get("cca3") or item.get("alpha3Code") or "").strip()
    
    name_dict = item.get("name", {})
    name_common = name_dict.get("common") if isinstance(name_dict, dict) else str(name_dict or "")
    name_official = name_dict.get("official") if isinstance(name_dict, dict) else ""
    if not name_common:
        name_common = str(item.get("name") or cca2)

    region = str(item.get("region") or "Unknown").strip()
    subregion = str(item.get("subregion") or "").strip()
    
    capital_list = item.get("capital", [])
    capital = capital_list[0] if isinstance(capital_list, list) and len(capital_list) > 0 else str(capital_list or "")

    population = int(item.get("population", 0) or 0)
    area = float(item.get("area", 0.0) or 0.0)
    density = round(population / max(area, 1.0), 2) if area > 0 else 0.0

    # Extract Currencies list
    currencies_data = item.get("currencies", {})
    curr_strs = []
    if isinstance(currencies_data, dict):
        for c_code, c_info in currencies_data.items():
            if isinstance(c_info, dict):
                c_name = c_info.get("name", c_code)
                c_sym = c_info.get("symbol", "")
                curr_strs.append(f"{c_code} ({c_name} {c_sym})".strip())
            else:
                curr_strs.append(str(c_code))
    currencies_formatted = ", ".join(curr_strs) if curr_strs else "N/A"

    # Extract Languages
    lang_data = item.get("languages", {})
    lang_strs = list(lang_data.values()) if isinstance(lang_data, dict) else []
    languages_formatted = ", ".join(lang_strs) if lang_strs else "N/A"

    flag_emoji = str(item.get("flag") or "")
    flags_dict = item.get("flags", {})
    flag_png = flags_dict.get("png", "") if isinstance(flags_dict, dict) else ""

    return {
        "cca2": cca2,
        "cca3": cca3,
        "name_common": name_common,
        "name_official": name_official,
        "region": region,
        "subregion": subregion,
        "capital": capital,
        "population": population,
        "area": area,
        "population_density": density,
        "currencies": currencies_formatted,
        "languages": languages_formatted,
        "flag_emoji": flag_emoji,
        "flag_png": flag_png
    }

def sync_countries_database():
    raw_list = fetch_raw_countries_api()
    conn = get_db_connection()
    cursor = conn.cursor()
    count = 0

    for item in raw_list:
        c = normalize_country_item(item)
        if not c or not c["cca2"]:
            continue
        cursor.execute("""
            INSERT OR REPLACE INTO countries (
                cca2, cca3, name_common, name_official, region, subregion,
                capital, population, area, population_density, currencies,
                languages, flag_emoji, flag_png
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            c["cca2"], c["cca3"], c["name_common"], c["name_official"], c["region"],
            c["subregion"], c["capital"], c["population"], c["area"],
            c["population_density"], c["currencies"], c["languages"],
            c["flag_emoji"], c["flag_png"]
        ))
        count += 1

    conn.commit()
    conn.close()
    return count

def get_countries_summary():
    conn = get_db_connection()
    df = pd.read_sql_query("SELECT * FROM countries", conn)
    conn.close()

    if df.empty:
        sync_countries_database()
        conn = get_db_connection()
        df = pd.read_sql_query("SELECT * FROM countries", conn)
        conn.close()

    if df.empty:
        return {
            "total_countries": 0, "total_population": 0, "regions_count": 0,
            "avg_density": 0, "region_breakdown": [], "top_populated": []
        }

    total_countries = int(len(df))
    total_population = int(df["population"].sum())
    avg_density = round(float(df["population_density"].mean()), 2)

    # Region Breakdown
    region_agg = df.groupby("region").agg(
        country_count=("cca2", "count"),
        total_pop=("population", "sum")
    ).reset_index().sort_values("total_pop", ascending=False)

    region_breakdown = []
    for _, r in region_agg.iterrows():
        region_breakdown.append({
            "region": r["region"],
            "count": int(r["country_count"]),
            "population": int(r["total_pop"])
        })

    # Top Populated Countries
    top_df = df.sort_values("population", ascending=False).head(10)
    top_populated = []
    for _, r in top_df.iterrows():
        top_populated.append({
            "code": r["cca2"],
            "name": r["name_common"],
            "population": int(r["population"]),
            "region": r["region"],
            "density": float(r["population_density"]),
            "currency": r["currencies"]
        })

    return {
        "total_countries": total_countries,
        "total_population": total_population,
        "avg_density": avg_density,
        "region_breakdown": region_breakdown,
        "top_populated": top_populated
    }

def get_countries_list(region=None, search=None, sort_by="population", page=1, limit=12):
    conn = get_db_connection()
    df = pd.read_sql_query("SELECT * FROM countries", conn)
    conn.close()

    if df.empty:
        sync_countries_database()
        conn = get_db_connection()
        df = pd.read_sql_query("SELECT * FROM countries", conn)
        conn.close()

    if region and region.lower() != "all":
        df = df[df["region"].str.lower() == region.lower()]

    if search:
        s = search.lower()
        df = df[
            df["name_common"].str.lower().str.contains(s) |
            df["name_official"].str.lower().str.contains(s) |
            df["cca2"].str.lower().str.contains(s) |
            df["currencies"].str.lower().str.contains(s)
        ]

    if sort_by == "density":
        df = df.sort_values("population_density", ascending=False)
    elif sort_by == "name":
        df = df.sort_values("name_common", ascending=True)
    else:
        df = df.sort_values("population", ascending=False)

    total_records = len(df)
    total_pages = (total_records + limit - 1) // limit if limit > 0 else 1
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit

    paginated_df = df.iloc[start_idx:end_idx]
    records = paginated_df.to_dict(orient="records")

    return {
        "data": records,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total_records,
            "totalPages": total_pages
        }
    }
