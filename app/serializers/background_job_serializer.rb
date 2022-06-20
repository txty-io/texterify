class BackgroundJobSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :status, :progress, :job_type
end
