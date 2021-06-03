require 'rails_helper'

RSpec.describe 'ValidationViolationsController', type: :routing do
  describe 'routing' do
    it 'routes to #index' do
      expect(get: "/validation_violations/index").to route_to("validation_violations#index")
    end
  end
end
