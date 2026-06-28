class Branch {
  const Branch({
    required this.id,
    required this.name,
    this.address,
    this.city,
  });

  final String id;
  final String name;
  final String? address;
  final String? city;

  factory Branch.fromMap(Map<String, dynamic> map) {
    return Branch(
      id: map['id'] as String,
      name: map['name'] as String,
      address: map['address'] as String?,
      city: map['city'] as String?,
    );
  }

  String get displayName {
    if (city == null || city!.isEmpty) {
      return name;
    }

    return '$name · $city';
  }
}
