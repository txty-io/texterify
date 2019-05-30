require 'test_helper'

class ProjectColumnsControllerTest < ActionDispatch::IntegrationTest
  test "should get create" do
    get project_columns_create_url
    assert_response :success
  end

  test "should get destroy" do
    get project_columns_destroy_url
    assert_response :success
  end

end
