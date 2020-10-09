require 'rails_helper'

RSpec.describe Api::V1::ReleasesController, type: :request do
  before(:each) do
    @user = FactoryBot.create(:user)
    @auth_params = sign_in(@user)
  end
end
