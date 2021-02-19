task create_test_licenses: [:environment] do
  Rake::Task['create_test_license_basic'].invoke
  Rake::Task['create_test_license_team'].invoke
  Rake::Task['create_test_license_business'].invoke
end
