from flask import Flask, request, jsonify, send_from_directory
from flask_restful import Api, Resource, reqparse
from flask_firebase_admin import FirebaseAdmin
from firebase_admin import credentials

app = Flask(__name__, static_url_path='', static_folder='frontend/build')
app.config["FIREBASE_ADMIN_CREDENTIAL"] = credentials.Certificate("key.json")
firebase = FirebaseAdmin(app)
api = Api(app)
db = firebase.firestore.client()

@app.route('/')
def index():
    return send_from_directory(app.static_folder,'index.html')

class PerformanceLogApiHandler(Resource):
	def get(self, log_id):
		doc_ref = db.collection('performance-logs').document(log_id)

		log = doc_ref.get()
		return log.to_dict()
	
	def post(self, log_id):
		json_body = request.json
		framerate = {}
		events = {}
		if 'frameRate' in json_body:
			framerate = json_body['frameRate']
		if 'event' in json_body:
			events = json_body['event']
		try:
			if framerate:
				db.collection("performance-logs").document(log_id).set({
					"FrameRateHistory": framerate
				}, merge=True)
			if events:
				db.collection("performance-logs").document(log_id).set({
					"EventHistory": events,
				}, merge=True)
		except (e) :
			print (e)
			return {"success": False}, 400
		
		return {"success": True, "log_id": log_id}, 200


class PerformanceLogListApiHandler(Resource):
	def get(self):
		logs = db.collection('performance-logs').stream()
		return [{'id': log.id, **log.to_dict()} for log in logs]
	
	def post(self):
		date, doc_ref = db.collection("performance-logs").add(request.json)
		print(doc_ref.id)
		return {"success": True, "log_id": doc_ref.id}, 200


api.add_resource(PerformanceLogApiHandler, '/api/performance_logs/<string:log_id>')
api.add_resource(PerformanceLogListApiHandler, '/api/performance_logs/')

app.run(host='0.0.0.0', port=81)