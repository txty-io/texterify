require 'rails_helper'

RSpec.describe Api::V1::DashboardController, type: :request do
  before(:each) do
    @user = create(:user)
    @auth_params = sign_in(@user)
  end
end
