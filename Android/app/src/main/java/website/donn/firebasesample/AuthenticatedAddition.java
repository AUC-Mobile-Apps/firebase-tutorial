package website.donn.firebasesample;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.gson.Gson;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;

import java.util.HashMap;
import java.util.Map;

public class AuthenticatedAddition extends AppCompatActivity {
    private static final String TAG = "AuthenticatedAddition";

    static class MyRequest {
        Integer num1;
        Integer num2;
    };
    static class MyResponse {
        Integer result;
    };

    Gson gson;
    RequestQueue queue;
    FirebaseUser user;

    EditText a, b;
    TextView result;
    Button addButton, testNotificationButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_authenticated_addition);

        user = FirebaseAuth.getInstance().getCurrentUser();

        queue = Volley.newRequestQueue(this);
        gson = new Gson();

        a = (EditText)findViewById(R.id.text_field_a);
        b = (EditText)findViewById(R.id.text_field_b);

        result = (TextView)findViewById(R.id.result_preview);

        addButton = (Button)findViewById(R.id.add_button);
        addButton.setOnClickListener(v -> {
            // Code here executes on main thread after user presses button
            Log.d("Connection", "Starting...");
            user.getIdToken(true).addOnCompleteListener(task -> {
                if (!task.isSuccessful()) {
                    Log.e(TAG, "Could not get authentication token.");
                    Toast.makeText(AuthenticatedAddition.this, "Could not authenticate. Try again later.", Toast.LENGTH_SHORT).show();
                    return;
                }
                Log.d("Connection", "Got token");
                String idToken = task.getResult().getToken();
                StringRequest example = new StringRequest(Request.Method.POST,
                    "http://10.0.2.2:3000/add",
                    response -> {
                        MyResponse r = gson.fromJson(response, MyResponse.class);
                        Log.d(TAG, "Responded with " + response);
                        result.setText("" + r.result);
                    }, error -> {
                        Log.e(TAG, "Connection error.");
                        Toast.makeText(AuthenticatedAddition.this, "Connection error. Try again later.", Toast.LENGTH_SHORT).show();
                    }
                ) {
                    @Override
                    public Map<String, String> getHeaders() throws AuthFailureError {
                        Map<String, String> params = new HashMap<String, String>();
                        params.put("Authorization", "Token " + idToken);
                        params.put("Content-Type", "application/json");
                        return params;
                    }

                    @Override
                    public byte[] getBody() {
                        MyRequest r = new MyRequest();
                        r.num1 = Integer.parseInt(a.getText().toString());
                        r.num2 = Integer.parseInt(b.getText().toString());

                        String json = gson.toJson(r);
                        return json.getBytes();
                    }
                };
                queue.add(example);
            });
        });

        testNotificationButton = (Button)findViewById(R.id.get_test_notification);
        testNotificationButton.setOnClickListener(v -> {
            user.getIdToken(true).addOnCompleteListener(task -> {
                if (!task.isSuccessful()) {
                    Log.e(TAG, "Could not get authentication token.");
                    Toast.makeText(AuthenticatedAddition.this, "Could not authenticate. Try again later.", Toast.LENGTH_SHORT).show();
                    return;
                }
                Log.d("Connection", "Got token");
                String idToken = task.getResult().getToken();
                StringRequest example = new StringRequest(Request.Method.POST,
                        "http://10.0.2.2:3000/send_test_notification",
                        response -> {
                            Log.d(TAG, "Check your notifications.");
                        }, error -> {
                            Log.e(TAG, "Connection error.");
                            Toast.makeText(AuthenticatedAddition.this, "Connection error. Try again later.", Toast.LENGTH_SHORT).show();
                        }
                ) {
                    @Override
                    public Map<String, String> getHeaders() throws AuthFailureError {
                        Map<String, String> params = new HashMap<String, String>();
                        params.put("Authorization", "Token " + idToken);
                        params.put("Content-Type", "application/json");
                        return params;
                    }

                    @Override
                    public byte[] getBody() {
                        return "{}".getBytes();
                    }
                };
                queue.add(example);
            });
        });
    }

}