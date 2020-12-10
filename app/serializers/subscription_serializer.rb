class SubscriptionSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id

  attribute :active do |object|
    object.stripe_status == 'active'
  end
end
