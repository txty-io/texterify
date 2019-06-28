module LoginHelper
  def sign_in(user)
    post new_user_session_path,
      params: {
        email: user.email,
        password: user.password
      }.to_json,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    auth_params = get_auth_params_from_login_response_headers(response)
  end

  def sign_in_invalid(user)
    post new_user_session_path,
      params: {
        email: user.email,
        password: 'invalid password'
      }.to_json,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    auth_params = get_auth_params_from_login_response_headers(response)
  end

  def get_auth_params_from_login_response_headers(response)
    client = response.headers['client']
    token = response.headers['access-token']
    expiry = response.headers['expiry']
    token_type = response.headers['token-type']
    uid = response.headers['uid']

    auth_params = {
      'access-token' => token,
      'client' => client,
      'uid' => uid,
      'expiry' => expiry,
      'token_type' => token_type
    }
    auth_params
  end
end
