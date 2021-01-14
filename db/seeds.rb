# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

load(Rails.root.join('db', 'seeds', "seeds_language_country_codes.rb").to_s)
load(Rails.root.join('db', 'seeds', "#{Rails.env.downcase}.rb").to_s)
