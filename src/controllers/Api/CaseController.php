<?php

namespace Abs\RsaCasePkg\Api;
use Abs\RsaCasePkg\CaseCancelledReason;
use Abs\RsaCasePkg\CaseStatus;
use Abs\RsaCasePkg\RsaCase;
use App\CallCenter;
use App\Client;
use App\District;
use App\Http\Controllers\Controller;
use App\MembershipType;
use App\ServiceType;
use App\VehicleMake;
use App\VehicleModel;
use DB;
use Illuminate\Http\Request;
use Validator;

class CaseController extends Controller {
	private $successStatus = 200;

	public function saveCase(Request $request) {
		DB::beginTransaction();
		try {
			$service_types = ServiceType::pluck('name')->toArray();
			$validator = Validator::make($request->all(), [
				//Ticket No
				'number' => 'required|string|max:32',
				//Ticket Date/Time /// YYYY-MM-DD HH:MM:SS /// 2017-01-24 15:31:38
				'date' => 'required|date_format:"Y-m-d H:i:s"',
				//Data filled on date/time
				'data_filled_date' => 'required|date_format:"Y-m-d H:i:s"',
				//Description
				'description' => 'nullable|string|max:255',
				//Case Status
				'status' => 'required|string|max:50|exists:case_statuses,name',
				//Case Cancel Reason
				'cancel_reason' => 'nullable|string|max:100|exists:case_cancelled_reasons,name',
				//Call centre
				'call_center' => 'required|string|max:64|exists:call_centers,name',
				//Client Name
				'client' => 'required|string|max:124|exists:clients,name',
				//Customer Name
				'customer_name' => 'required|string|max:128',
				//Customer Phone Number
				'customer_contact_number' => 'required|string|max:10',
				//Case Contact Name
				'contact_name' => 'nullable|string|max:128',
				//Case Contact Number
				'contact_number' => 'nullable|string|max:10',
				//Vehicle Make
				'vehicle_make' => 'required|string|max:191|exists:vehicle_makes,name',
				//Vehicle Model
				'vehicle_model' => 'nullable|string|max:191|exists:vehicle_models,name',
				//Vehicle Registration Number
				'vehicle_registration_number' => 'required|string|max:191',
				//VIN
				'vin_no' => 'nullable|string|max:191',
				//Membership Type
				'membership_type' => 'required|string|max:255|exists:membership_types,name',
				//Membership Number
				'membership_number' => 'nullable|string|max:255',
				//Subject
				'subject' => 'required|string|max:191|exists:subjects,name',
				//KM during breakdown
				'km_during_breakdown' => 'nullable',
				//BD Location Latitude
				'bd_lat' => 'nullable',
				//BD Location Longitude
				'bd_long' => 'nullable',
				//BD Location
				'bd_location' => 'nullable|string|max:2048',
				//BD City
				'bd_city' => 'nullable|string|max:128|exists:districts,name',
				//BD State
				'bd_state' => 'nullable|string|max:50|exists:states,name',
			]);

			if ($validator->fails()) {
				return response()->json(['success' => false, 'message' => 'Validation Error', 'errors' => $validator->errors()->all()], $this->successStatus);
			}

			$status = CaseStatus::where('name', $request->status)->first();
			$call_center = CallCenter::where('name', $request->call_center)->first();
			$client = Client::where('name', $request->client)->first();
			$vehicle_make = VehicleMake::where('name', $request->vehicle_make)->first();
			$vehicle_model = VehicleModel::where('vehicle_make_id', $vehicle_make->id)->first();
			$membership_type = MembershipType::where('name', $request->membership_type)->first();
			$subject = Subject::where('name', $request->subject)->first();

			$bd_city = District::where('name', $request->bd_city)->first();
			if (!$bd_city) {
				$bd_city_id = NULL;
			} else {
				$bd_city_id = $bd_city->id;
			}

			$cancel_reason = CaseCancelledReason::where('name', $request->cancel_reason)->first();
			if (!$cancel_reason) {
				$cancel_reason_id = NULL;
			} else {
				$cancel_reason_id = $cancel_reason->id;
			}

			$case = RsaCase::firstOrNew([
				'company_id' => 1,
				'number' => $request->number,
			]);
			$case->fill($request->all());
			$case->status_id = $status->id;
			$case->cancel_reason_id = $cancel_reason_id;
			$case->call_center_id = $call_center->id;
			$case->vehicle_model_id = $vehicle_model->id;
			$case->membership_type_id = $membership_type->id;
			$case->subject_id = $subject->id;
			$case->bd_city_id = $bd_city_id;
			$case->save();

			DB::commit();
			return response()->json(['success' => true, 'message' => 'Case saved successfully'], $this->successStatus);
		} catch (\Exception $e) {
			DB::rollBack();
			return response()->json(['success' => false, 'errors' => [$e->getMessage() . ' Line:' . $e->getLine()]], $this->successStatus);
		}
	}

	public function saveActivity(Request $request) {
		DB::beginTransaction();
		try {
			$service_types = ServiceType::pluck('name')->toArray();
			$validator = Validator::make($request->all(), [
				//Activity ID
				'activity_id' => 'required|numeric',
				//Ticket No
				'case_id' => 'required|string|max:32',
				//Case Status
				'case_status' => 'required|string|max:50',
				//Service Description
				'service_description' => 'nullable|string|max:24',
				//Service Cancel Reason
				'service_cancel_reason' => 'nullable|string|max:100',
				//Amount
				'amount' => 'nullable|numeric',
				//Payment Mode
				'payment_mode' => 'nullable|string|max:50',
				//Remarks
				'remarks' => 'nullable|string|max:512',
				//Service Status
				'service_status' => 'required|string|max:50',
				//Drop Location Type
				'drop_location_type' => 'nullable|string|max:24',
				//Customer Preferred Location Type
				'customer_preferred_location_type' => 'nullable|string|max:24',
				//Drop Dealer
				'drop_dealer' => 'nullable|string|max:64',
				//Drop Location
				'drop_location' => 'nullable|string|max:512',
				//Drop Location Lat
				'drop_location_lat' => 'nullable|numeric',
				//Drop Location Long
				'drop_location_long' => 'nullable|numeric',
				//Extra Short Km
				'extra_short_km' => 'nullable|numeric',
				//Activity Status
				'activity_status' => 'required|string|max:50',
				//Asp Code
				'asp_code' => 'required|string|max:24',
				//Asp Accepted/Rejected
				'asp_accepted_rejected' => 'nullable|string|max:50',
				//Reject Cancel Reason
				'reject_cancel_reason' => 'nullable|string|max:256',
				//Asp Reached Datetime
				'asp_reached_datetime' => 'nullable|date_format:"Y-m-d H:i:s"',
				//Asp Start Location
				'asp_start_location' => 'nullable|string|max:256',
				//Asp End Location
				'asp_end_location' => 'nullable|string|max:256',
				//Asp BD Google KM
				'asp_bd_google_km' => 'nullable|numeric',
				//BD Dealer Google KM
				'bd_dealer_google_km' => 'nullable|numeric',
				//Return Google KM
				'return_google_km' => 'nullable|numeric',
				//Asp BD Return Empty KM
				'asp_bd_return_empty_km' => 'nullable|numeric',
				//BD Dealer KM
				'bd_dealer_km' => 'nullable|numeric',
				//Return KM
				'return_km' => 'nullable|numeric',
				//Total Travel Google KM
				'total_travel_google_km' => 'nullable|numeric',
				//Total Travel KM
				'total_travel_km' => 'nullable|numeric',
				//Service Charges
				'service_charges' => 'nullable|numeric',
				//Membership Charges
				'membership_charges' => 'nullable|numeric',
				//Toll Charges
				'toll_charges' => 'nullable|numeric',
				//Green Tax Charges
				'green_tax_charges' => 'nullable|numeric',
				//Border Charges
				'border_charges' => 'nullable|numeric',
				//Paid To
				'paid_to' => 'nullable|string|max:24',
				//Payment Receipt No
				'payment_receipt_no' => 'nullable|string|max:24',
				//Amount Collected From Customer
				'amount_collected_from_customer' => 'nullable|numeric',
			]);

			if ($validator->fails()) {
				return response()->json(['success' => false, 'message' => 'Validation Error', 'errors' => $validator->errors()->all()], $this->successStatus);
			}

			DB::commit();
			return response()->json(['success' => true, 'message' => 'Activity created successfully'], $this->successStatus);
		} catch (\Exception $e) {
			DB::rollBack();
			return response()->json(['success' => false, 'errors' => [$e->getMessage() . ' Line:' . $e->getLine()]], $this->successStatus);
		}
	}

}
