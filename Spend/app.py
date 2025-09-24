
import os
from flask import Flask, render_template, request, redirect, url_for, send_from_directory, flash, Response
from werkzeug.utils import secure_filename
import sqlite3
from datetime import datetime
from functools import wraps
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER", "uploads")
DATABASE      = os.environ.get("DATABASE", "submissions.db")
ADMIN_USER    = os.environ.get("ADMIN_USER", "admin")
ADMIN_PASS    = os.environ.get("ADMIN_PASS", "changeme")
MAX_CONTENT_LENGTH_MB = int(os.environ.get("MAX_CONTENT_LENGTH_MB", "50"))

ALLOWED_EXTENSIONS = set([
    "pdf","png","jpg","jpeg","csv","xlsx","xls","doc","docx","txt","heic","webp"
])

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH_MB * 1024 * 1024
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "devsecret")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as db:
        db.executescript(open("schema.sql","r",encoding="utf-8").read())

if not os.path.exists(DATABASE):
    init_db()

def allowed_file(filename):
    return "." in filename and filename.rsplit(".",1)[1].lower() in ALLOWED_EXTENSIONS

def check_auth(username, password):
    return username == ADMIN_USER and password == ADMIN_PASS

def authenticate():
    return Response("Login required", 401, {"WWW-Authenticate":"Basic realm=\"Admin\""},)

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password):
            return authenticate()
        return f(*args, **kwargs)
    return decorated

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/onboarding", methods=["GET"])
def onboarding():
    return redirect(url_for('onboarding_step', step=1))

@app.route("/onboarding/step-<int:step>", methods=["GET", "POST"])
def onboarding_step(step):
    if request.method == "POST":
        # Store form data in session
        for key, value in request.form.items():
            session[key] = value
        
        # Handle file uploads for step 7
        if step == 7:
            files = request.files.getlist("files")
            uploaded_files = []
            for f in files:
                if f and f.filename:
                    filename = secure_filename(f.filename)
                    if allowed_file(filename):
                        path = os.path.join(app.config["UPLOAD_FOLDER"], f"{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}_{filename}")
                        f.save(path)
                        uploaded_files.append({'filename': filename, 'path': path})
            session['uploaded_files'] = uploaded_files
        
        # Redirect to next step
        if step < 8:
            return redirect(url_for('onboarding_step', step=step + 1))
        else:
            return redirect(url_for('submit'))
    
    # GET request - show current step
    return render_template("onboarding.html", current_step=step)

@app.route("/submit", methods=["POST"])
def submit():
    # Get data from session (onboarding flow) or form (direct submission)
    if session.get('business_name'):
        # Data from onboarding flow
        fields = {
            "business_name": session.get("business_name","").strip(),
            "contact_name": session.get("contact_name","").strip(),
            "phone": session.get("phone","").strip(),
            "email": session.get("email","").strip(),
            "address": session.get("address","").strip(),
            "website": session.get("website","").strip(),
            "locations_count": session.get("locations_count","").strip(),
            "cuisine_type": session.get("cuisine_type","").strip(),
            "monthly_spend": session.get("monthly_spend","").strip(),
            "monthly_sales": session.get("monthly_sales","").strip(),
            "food_cost_pct": session.get("food_cost_pct","").strip(),
            "inventory_frequency": session.get("inventory_frequency","").strip(),
            "inventory_method": session.get("inventory_method","").strip(),
            "systems_used": session.get("systems_used","").strip(),
            "vendors": session.get("vendors","").strip(),
            "prime_vendor_pct": session.get("prime_vendor_pct","").strip(),
            "goals": session.get("goals","").strip(),
            "tier": session.get("plan_tier","").strip(),
            "terms_agreed": "yes",
            "created_at": datetime.utcnow().isoformat()
        }
    else:
        # Data from direct form submission
        form = request.form
        fields = {
            "business_name": form.get("business_name","").strip(),
            "contact_name": form.get("contact_name","").strip(),
            "phone": form.get("phone","").strip(),
            "email": form.get("email","").strip(),
            "address": form.get("address","").strip(),
            "website": form.get("website","").strip(),
            "locations_count": form.get("locations_count","").strip(),
            "cuisine_type": form.get("cuisine_type","").strip(),
            "monthly_spend": form.get("monthly_spend","").strip(),
            "monthly_sales": form.get("monthly_sales","").strip(),
            "food_cost_pct": form.get("food_cost_pct","").strip(),
            "inventory_frequency": form.get("inventory_frequency","").strip(),
            "inventory_method": form.get("inventory_method","").strip(),
            "systems_used": form.get("systems_used","").strip(),
            "vendors": form.get("vendors","").strip(),
            "prime_vendor_pct": form.get("prime_vendor_pct","").strip(),
            "goals": form.get("goals","").strip(),
            "tier": form.get("tier","").strip(),
            "terms_agreed": "yes" if form.get("terms_agreed") == "on" else "no",
            "created_at": datetime.utcnow().isoformat()
        }

    with get_db() as db:
        cur = db.execute("""
            INSERT INTO submissions (
                business_name, contact_name, phone, email, address, website,
                locations_count, cuisine_type, monthly_spend, monthly_sales,
                food_cost_pct, inventory_frequency, inventory_method,
                systems_used, vendors, prime_vendor_pct, goals, tier, terms_agreed, created_at
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (
            fields["business_name"], fields["contact_name"], fields["phone"], fields["email"], fields["address"], fields["website"],
            fields["locations_count"], fields["cuisine_type"], fields["monthly_spend"], fields["monthly_sales"],
            fields["food_cost_pct"], fields["inventory_frequency"], fields["inventory_method"],
            fields["systems_used"], fields["vendors"], fields["prime_vendor_pct"], fields["goals"], fields["tier"], fields["terms_agreed"], fields["created_at"]
        ))
        submission_id = cur.lastrowid

        # Handle files from session (onboarding) or form (direct submission)
        if session.get('uploaded_files'):
            # Files from onboarding flow
            for file_info in session['uploaded_files']:
                db.execute("INSERT INTO files (submission_id, filename, stored_path, uploaded_at) VALUES (?,?,?,?)",
                           (submission_id, file_info['filename'], file_info['path'], datetime.utcnow().isoformat()))
        else:
            # Files from direct form submission
            files = request.files.getlist("files")
            for f in files:
                if f and f.filename:
                    filename = secure_filename(f.filename)
                    if not allowed_file(filename):
                        flash(f"File type not allowed: {filename}")
                        continue
                    path = os.path.join(app.config["UPLOAD_FOLDER"], f"{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}_{filename}")
                    f.save(path)
                    db.execute("INSERT INTO files (submission_id, filename, stored_path, uploaded_at) VALUES (?,?,?,?)",
                               (submission_id, filename, path, datetime.utcnow().isoformat()))

    # Clear session data after successful submission
    session.clear()
    
    return render_template("thanks.html")

@app.route("/admin")
@requires_auth
def admin():
    with get_db() as db:
        rows = db.execute("""
            SELECT s.*, COUNT(f.id) as file_count 
            FROM submissions s 
            LEFT JOIN files f ON s.id = f.submission_id 
            GROUP BY s.id 
            ORDER BY s.created_at DESC
        """).fetchall()
    return render_template("admin.html", rows=rows)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "8000")), debug=True)
